/**
 * SAVE / LOAD — persists GameState to localStorage.
 *
 * Handles the tricky non-JSON types:
 *   - Set<string>  →  array on disk
 *
 * Autosave fires after every dispatched action via an effect in GameStore.
 * Writes are debounced (200ms) so rapid-fire actions don't thrash storage.
 *
 * Save slots: a single 'main' slot for now. Multi-slot later if desired.
 */

import type { GameState } from './types';
import { initialState } from './initialState';

const SAVE_KEY = 'iron-core:save:main';
const SAVE_VERSION = 1;

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

/** Write current state to localStorage. */
export function writeSave(state: GameState): void {
  try {
    const payload: SavedShape = {
      version: SAVE_VERSION,
      savedAt: Date.now(),
      state: serialize(state),
    };
    localStorage.setItem(SAVE_KEY, JSON.stringify(payload));
  } catch (e) {
    // localStorage can fail (quota, private browsing). Fail silent.
    console.warn('[save] write failed', e);
  }
}

/** Check if a save exists without parsing it. */
export function hasSave(): boolean {
  try {
    return !!localStorage.getItem(SAVE_KEY);
  } catch {
    return false;
  }
}

/** Read a save summary (for the load-game button). */
export function readSaveSummary(): { savedAt: number; playerName: string; fame: number; bots: number } | null {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
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

/** Read and parse the full save. Returns null if missing or corrupt. */
export function readSave(): GameState | null {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return null;
    const parsed: SavedShape = JSON.parse(raw);
    if (parsed.version !== SAVE_VERSION) {
      // Future migration logic goes here. For now, refuse to load mismatches.
      console.warn('[save] version mismatch, ignoring save');
      return null;
    }
    return deserialize(parsed.state);
  } catch (e) {
    console.warn('[save] read failed', e);
    return null;
  }
}

/** Wipe the save. Used by "New Game" after confirmation. */
export function deleteSave(): void {
  try {
    localStorage.removeItem(SAVE_KEY);
  } catch {
    // ignore
  }
}
