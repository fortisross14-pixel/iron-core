/**
 * FACTION COLLECTION — pure functions.
 *
 * Each mecha and weapon belongs to a faction based on its type (mechas) or
 * the type it's tagged with (weapons). Players earn faction "collection
 * points" for owning each distinct faction-aligned mecha or weapon.
 *
 * Point values by rarity (mechas):
 *   common:    1
 *   uncommon:  2
 *   rare:      3
 *   epic:      5
 *   legendary: 10
 *   starter:   1   (starters count too)
 *
 * Point values by tier (weapons):
 *   basic:    1   (weapons priced <= 800)
 *   advanced: 2   (priced 800-1800)
 *   special:  3   (priced > 1800)
 *
 * Faction "leader": you've collected ALL mechas of your faction's types.
 * Faction "president": you've also collected ALL faction-aligned weapons,
 *                       AND defeated the current faction president (Step 3e).
 *
 * Big fame reward: +500 fame on Leader, +1000 on President.
 */

import { MODELS, MODEL_LIST, type ModelData } from '../data/models';
import { WEAPONS, type Weapon } from '../data/weapons';
import { FACTIONS, type FactionId } from '../data/factions';
import type { MechaType } from '../data/types';

/** Determine which faction owns a given mecha type. */
export function factionForType(t: MechaType): FactionId | null {
  for (const f of Object.values(FACTIONS)) {
    if (f.preferredTypes.includes(t)) return f.id;
  }
  return null;
}

const RARITY_POINTS: Record<string, number> = {
  starter: 1,
  common: 1,
  uncommon: 2,
  rare: 3,
  epic: 5,
  legendary: 10,
  god: 0,        // god-type mechas don't belong to any faction
};

function weaponTier(w: Weapon): 'basic' | 'advanced' | 'special' {
  if (w.price <= 800) return 'basic';
  if (w.price <= 1800) return 'advanced';
  return 'special';
}

const WEAPON_POINTS: Record<string, number> = {
  basic: 1,
  advanced: 2,
  special: 3,
};

export interface FactionCollectionStats {
  factionId: FactionId;
  // Mechas
  mechaTotal: number;
  mechaOwned: number;
  mechaPoints: number;
  mechaMaxPoints: number;
  // Weapons
  weaponTotal: number;
  weaponOwned: number;
  weaponPoints: number;
  weaponMaxPoints: number;
  // Status
  isLeader: boolean;        // all mechas collected
  isPresident: boolean;     // all mechas + all weapons collected
}

export function computeFactionCollection(
  factionId: FactionId,
  discoveredModelIds: Set<string>,
  ownedWeaponIds: Set<string>,
): FactionCollectionStats {
  const faction = FACTIONS[factionId];
  const factionMechas = MODEL_LIST.filter(m => faction.preferredTypes.includes(m.type));
  const factionWeapons = Object.values(WEAPONS).filter(w =>
    w.type !== null && faction.preferredTypes.includes(w.type)
  );

  let mechaOwned = 0, mechaPoints = 0, mechaMaxPoints = 0;
  for (const m of factionMechas) {
    const pts = RARITY_POINTS[m.rarity] ?? 1;
    mechaMaxPoints += pts;
    if (discoveredModelIds.has(m.id)) {
      mechaOwned += 1;
      mechaPoints += pts;
    }
  }

  let weaponOwned = 0, weaponPoints = 0, weaponMaxPoints = 0;
  for (const w of factionWeapons) {
    const pts = WEAPON_POINTS[weaponTier(w)] ?? 1;
    weaponMaxPoints += pts;
    if (ownedWeaponIds.has(w.id)) {
      weaponOwned += 1;
      weaponPoints += pts;
    }
  }

  const isLeader = factionMechas.length > 0 && mechaOwned === factionMechas.length;
  const isPresident = isLeader
    && factionWeapons.length > 0
    && weaponOwned === factionWeapons.length;

  return {
    factionId,
    mechaTotal: factionMechas.length,
    mechaOwned,
    mechaPoints,
    mechaMaxPoints,
    weaponTotal: factionWeapons.length,
    weaponOwned,
    weaponPoints,
    weaponMaxPoints,
    isLeader,
    isPresident,
  };
}

/** List the mechas in a faction (with owned/not flag). */
export function listFactionMechas(
  factionId: FactionId,
  discoveredModelIds: Set<string>,
): { model: ModelData; owned: boolean; points: number }[] {
  const faction = FACTIONS[factionId];
  return MODEL_LIST
    .filter(m => faction.preferredTypes.includes(m.type))
    .map(m => ({
      model: m,
      owned: discoveredModelIds.has(m.id),
      points: RARITY_POINTS[m.rarity] ?? 1,
    }))
    .sort((a, b) => a.model.dexNo - b.model.dexNo);
}

/** List the weapons in a faction (with owned/not flag). */
export function listFactionWeapons(
  factionId: FactionId,
  ownedWeaponIds: Set<string>,
): { weapon: Weapon; owned: boolean; points: number; tier: string }[] {
  const faction = FACTIONS[factionId];
  return Object.values(WEAPONS)
    .filter(w => w.type !== null && faction.preferredTypes.includes(w.type))
    .map(w => {
      const t = weaponTier(w);
      return { weapon: w, owned: ownedWeaponIds.has(w.id), points: WEAPON_POINTS[t] ?? 1, tier: t };
    })
    .sort((a, b) => a.weapon.price - b.weapon.price);
}
