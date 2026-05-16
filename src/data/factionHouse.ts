/**
 * Faction integration helpers.
 *
 * Derives runtime data for faction houses from MODELS + WEAPONS + FACTIONS,
 * keyed on (factionId, city tier). Keeps the data tables compact: no hand-
 * authoring of 6 spawn pools and 6 store inventories.
 *
 * Rules:
 *   - Grind spawn pools use only mechas whose type is in faction.preferredTypes.
 *     Voltspire (town):    uncommon + rare
 *     Hollowmere (city):   rare + epic
 *     (Future capital):    legendary (when added)
 *   - Faction store sells exclusive advanced faction weapons + a curated set of
 *     basic store weapons at a 15% discount.
 *   - Both grind and store are gated to faction members. Non-members see only
 *     collection status (the original 3b view).
 */

import { MODELS } from './models';
import type { Rarity } from './models';
import { FACTIONS } from './factions';
import type { FactionId } from './factions';
import { WEAPONS } from './weapons';
import { CITIES } from './cities';
import type { CityTier } from './cities';

/** Discount applied to faction-store weapons (15%). */
export const FACTION_STORE_DISCOUNT = 0.15;

/** Rarity windows by city tier. */
const RARITY_WINDOW: Record<CityTier, Rarity[]> = {
  village: [],
  town:    ['uncommon', 'rare'],
  city:    ['rare', 'epic'],
};

/** Compute the spawn pool for a faction grind area in a given city. */
export function getFactionGrindPool(
  factionId: FactionId,
  cityId: string,
): { modelId: string; weight: number; minLevel: number; maxLevel: number }[] {
  const tier = CITIES[cityId]?.tier ?? 'village';
  const window = RARITY_WINDOW[tier];
  if (window.length === 0) return [];
  const types = FACTIONS[factionId].preferredTypes;

  // Find all mechas whose type ∈ faction types AND rarity ∈ window
  const matching = Object.values(MODELS).filter(
    m => types.includes(m.type) && window.includes(m.rarity),
  );

  // Level range scales with tier
  const [minLvl, maxLvl] = tier === 'town' ? [6, 12] : [12, 22];

  return matching.map(m => ({
    modelId: m.id,
    weight: m.rarity === 'rare' ? 3 : m.rarity === 'epic' ? 1 : 4,  // common-ish first
    minLevel: minLvl,
    maxLevel: maxLvl,
  }));
}

/** Faction-exclusive advanced weapons. Mapped by faction. */
export const FACTION_EXCLUSIVE_WEAPONS: Record<FactionId, string[]> = {
  naturesOwn:     ['living_blade', 'rootmaul'],
  elementalists:  ['ember_lance', 'riptide_glaive', 'rimecutter'],
  industrials:    ['factory_press', 'arc_caster', 'cogwave_emitter'],
};

/** Basic store weapons offered at the faction store with the faction discount. */
const FACTION_BASIC_WEAPONS: Record<FactionId, string[]> = {
  naturesOwn:     ['spore_caster', 'earth_drill'],
  elementalists:  ['cinder_cannon', 'tide_blaster', 'cryo_coil'],
  industrials:    ['sledge_arm', 'thunder_rod', 'neural_emitter'],
};

/** Full faction store inventory (basic discount + exclusive advanced). */
export function getFactionStoreInventory(factionId: FactionId): string[] {
  return [
    ...FACTION_BASIC_WEAPONS[factionId],
    ...FACTION_EXCLUSIVE_WEAPONS[factionId],
  ];
}

/** Compute discounted price for a faction-store weapon. */
export function factionStorePrice(weaponId: string): number {
  const w = WEAPONS[weaponId];
  if (!w) return 0;
  return Math.round(w.price * (1 - FACTION_STORE_DISCOUNT));
}
