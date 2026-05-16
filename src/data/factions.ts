/**
 * Factions. Three factions. Player picks one early.
 *
 * Each faction:
 *   - has affinity for 2-3 mecha types (small combat bonus when using those)
 *   - has a baseline alignment position on the (good ↔ evil) × (offensive ↔ defensive) quadrant
 *   - has a temperament: peaceful (tournaments) vs warring (factional conflicts)
 *
 * Player actions move a personal alignment needle. Over time the player drifts
 * toward whichever faction they actually behave like — that drives narrative.
 */

import type { MechaType } from './types';

export type FactionId = 'naturesOwn' | 'elementalists' | 'industrials';

export type Temperament = 'peaceful' | 'warring';

export interface Faction {
  id: FactionId;
  name: string;
  shortName: string;
  motto: string;
  desc: string;
  longDesc: string;
  preferredTypes: MechaType[];
  affinityBonus: number;       // multiplier applied to damage of preferred types
  temperament: Temperament;
  // baseline alignment (where the faction sits on the quadrant)
  alignment: {
    moral: number;        // -100 (evil) … +100 (good)
    posture: number;      // -100 (defensive) … +100 (offensive)
  };
}

export const FACTIONS: Record<FactionId, Faction> = {
  naturesOwn: {
    id: 'naturesOwn',
    name: "Nature's Own",
    shortName: 'NATURE',
    motto: 'Grow what was broken.',
    desc: 'Operators who build mechs from living matter and old stone.',
    longDesc:
      "Nature's Own believe the Sundering happened because the old world betrayed " +
      "the soil. They keep gardens inside their workshops. Their mechs grow as much " +
      "as they're assembled. They favor Bio and Earth frames, hate factories, and " +
      "won't enter Industrial-aligned tournaments unless forced. Mostly peaceful — they " +
      "fight only when their groves are threatened.",
    preferredTypes: ['bio', 'earth'],
    affinityBonus: 1.10,
    temperament: 'peaceful',
    alignment: { moral: 30, posture: -40 },
  },
  elementalists: {
    id: 'elementalists',
    name: 'The Elementalists',
    shortName: 'ELEMENTAL',
    motto: 'The storm decides.',
    desc: 'Wandering Operators who chase fire and tide.',
    longDesc:
      "The Elementalists are a loose coalition — caravans, river-folk, salt-miners — " +
      "who built their faction around the volatile types. Fire, Water, Ice. They " +
      "have no fixed city, but every two seasons they call a Convergence in whichever " +
      "town will host them. They will fight anyone, including each other, but only on " +
      "the open road. They consider Industrial city circuits dishonest.",
    preferredTypes: ['fire', 'water', 'ice'],
    affinityBonus: 1.10,
    temperament: 'warring',
    alignment: { moral: 0, posture: 30 },
  },
  industrials: {
    id: 'industrials',
    name: 'The Industrial Revolutionaries',
    shortName: 'INDUSTRIAL',
    motto: 'Build the future. Sell it twice.',
    desc: 'City-aligned Operators backing factory-made models.',
    longDesc:
      "The Industrials run the cities. They own the foundries, the official tournament " +
      "circuit, and most of the credit lenders. They favor Steel and Lightning frames — " +
      "machines that ship on schedule. They are at war with Nature's Own over " +
      "land-rights, and with the Elementalists over circuit access. They are not " +
      "evil, but they are not patient either.",
    preferredTypes: ['steel', 'lightning'],
    affinityBonus: 1.10,
    temperament: 'warring',
    alignment: { moral: -10, posture: 40 },
  },
};

export const FACTION_LIST: Faction[] = Object.values(FACTIONS);
