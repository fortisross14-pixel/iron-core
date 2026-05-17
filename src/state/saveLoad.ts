/**
 * SAVE / LOAD — persists GameState to localStorage across THREE save slots.
 *
 * Handles the tricky non-JSON types:
 *   - Set<string>  →  array on disk
 *
 * Slot model:
 *   - Three independent slots: 1, 2, 3
 *   - At boot, the player picks which slot to load (or starts new in any slot)
 *   - Once a slot is picked, all autosaves go to that slot for the session
 *   - Slot choice is held in memory by Boot.tsx — there is no "currently active slot" persisted
 *
 * Migration:
 *   - If a legacy single-slot save exists (key 'iron-core:save:main'), it is
 *     auto-imported into slot 1 the first time the user boots, then removed.
 *
 * Autosave fires after every dispatched action via an effect in GameStore.
 * Writes are debounced (200ms) so rapid-fire actions don't thrash storage.
 */

import type { GameState } from './types';
import { initialState } from './initialState';

export type SaveSlot = 1 | 2 | 3;
const ALL_SLOTS: SaveSlot[] = [1, 2, 3];

const SAVE_KEY_PREFIX = 'iron-core:save:slot:';
const LEGACY_SAVE_KEY = 'iron-core:save:main';  // pre-multi-slot key
const SAVE_VERSION = 1;

function keyForSlot(slot: SaveSlot): string {
  return `${SAVE_KEY_PREFIX}${slot}`;
}

/** Top-level Set-keyed fields in GameState that need array serialization. */
const SET_FIELDS = [
  'defeatedTrainerIds',
  'encounteredTrainerIds',
  'discovered',
  'storyFlags',
  'unlockedCities',
  'unlockedTournaments',
  'unlockedFeatures',
] as const;

interface SavedShape {
  version: number;
  savedAt: number;
  state: any;  // Serialized state with Sets converted to arrays
}

export interface SaveSummary {
  savedAt: number;
  playerName: string;
  fame: number;
  bots: number;
}

/** Convert GameState → JSON-safe object. */
function serialize(state: GameState): any {
  const out: any = { ...state };
  for (const field of SET_FIELDS) {
    const v = (state as any)[field];
    if (v instanceof Set) {
      out[field] = Array.from(v);
    }
  }
  return out;
}

/** Convert saved object → GameState (restores Set fields). */
function deserialize(saved: any): GameState {
  const out: any = { ...initialState, ...saved };
  for (const field of SET_FIELDS) {
    const v = saved[field];
    out[field] = new Set(Array.isArray(v) ? v : []);
  }
  // Future-proof: ensure all required fields exist (older saves might miss new ones)
  if (!out.batteryInv) out.batteryInv = {};
  if (typeof out.playerName !== 'string') out.playerName = '';
  // Hometown must always be unlocked, even if a corrupt save lost it
  if (!out.unlockedCities.has('ironhaven')) out.unlockedCities.add('ironhaven');
  return out as GameState;
}

/** Migrate the old single-slot save into slot 1, if it exists.
 *  Idempotent — safe to call on every boot. */
function migrateLegacyIfNeeded(): void {
  try {
    const legacy = localStorage.getItem(LEGACY_SAVE_KEY);
    if (!legacy) return;
    // Don't overwrite slot 1 if it already has content
    const slot1Existing = localStorage.getItem(keyForSlot(1));
    if (!slot1Existing) {
      localStorage.setItem(keyForSlot(1), legacy);
    }
    // Either way, remove the legacy key so we don't migrate again
    localStorage.removeItem(LEGACY_SAVE_KEY);
  } catch (e) {
    console.warn('[save] migration skipped', e);
  }
}

// Run migration once on module load
migrateLegacyIfNeeded();

/** Write current state to localStorage under the given slot. */
export function writeSave(slot: SaveSlot, state: GameState): void {
  try {
    const payload: SavedShape = {
      version: SAVE_VERSION,
      savedAt: Date.now(),
      state: serialize(state),
    };
    localStorage.setItem(keyForSlot(slot), JSON.stringify(payload));
  } catch (e) {
    // localStorage can fail (quota, private browsing). Fail silent.
    console.warn('[save] write failed', e);
  }
}

/** Check whether a specific slot has a save. */
export function hasSave(slot: SaveSlot): boolean {
  try {
    return !!localStorage.getItem(keyForSlot(slot));
  } catch {
    return false;
  }
}

/** Returns true if ANY slot has a save. */
export function hasAnySave(): boolean {
  return ALL_SLOTS.some(s => hasSave(s));
}

/** Read a save summary for a specific slot. Returns null if no save in that slot. */
export function readSaveSummary(slot: SaveSlot): SaveSummary | null {
  try {
    const raw = localStorage.getItem(keyForSlot(slot));
    if (!raw) return null;
    const parsed: SavedShape = JSON.parse(raw);
    return {
      savedAt: parsed.savedAt,
      playerName: parsed.state.playerName || 'TRAINER',
      fame: parsed.state.fame ?? 0,
      bots: (parsed.state.bots ?? []).length,
    };
  } catch {
    return null;
  }
}

/** Read summaries for all 3 slots in order. Each entry is summary or null. */
export function readAllSummaries(): (SaveSummary | null)[] {
  return ALL_SLOTS.map(s => readSaveSummary(s));
}

/** Read and parse the full save for a specific slot. Returns null if missing/corrupt. */
export function readSave(slot: SaveSlot): GameState | null {
  try {
    const raw = localStorage.getItem(keyForSlot(slot));
    if (!raw) return null;
    const parsed: SavedShape = JSON.parse(raw);
    if (parsed.version !== SAVE_VERSION) {
      console.warn('[save] version mismatch in slot', slot, '— ignoring');
      return null;
    }
    return deserialize(parsed.state);
  } catch (e) {
    console.warn('[save] read failed for slot', slot, e);
    return null;
  }
}

/** Wipe a specific slot. Used by "New Game" after confirmation. */
export function deleteSave(slot: SaveSlot): void {
  try {
    localStorage.removeItem(keyForSlot(slot));
  } catch {
    // ignore
  }
}
