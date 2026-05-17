/**
 * HOLLOWMERE — coastal trade city. Water-themed.
 *
 * Unlock: `voltspire_amateur_won` (told about it by Renn after winning Bronze).
 *
 * Structure:
 *   - Square, Market, two water grind zones (basic + deep)
 *   - Four tournaments (amateur, official, pro, elite). Amateur free; others
 *     tier-gated. Elite is purely aspirational at this story stage.
 *   - The MFC Tower — central hub for tier-up exams (Official, Pro, Elite)
 *     with three gates each: fame + medals + defeat a gatekeeper.
 *   - The three faction headquarters (presidents) — see existing data.
 */

import type { Place } from './types';

export const HOLLOWMERE_PLACES: Place[] = [
  {
    id: 'holl_square',
    cityId: 'hollowmere',
    name: 'Hollowmere Square',
    kind: 'story_place',
    shortDesc: 'Harbor plaza. Salt air. Trade banners.',
    desc: "The city plaza opens out onto the bay. Ships move on the water. The MFC tower stands at the harbor mouth like a lighthouse — everything in this city orbits around it.",
    requires: { storyFlags: ['voltspire_amateur_won'] },
  },
  {
    id: 'holl_market',
    cityId: 'hollowmere',
    name: 'Hollowmere Market',
    kind: 'store',
    shortDesc: 'Top-tier weapons, batteries, disks.',
    desc: 'A sprawling market that runs three city blocks. The best gear in the world, if you can afford it.',
    requires: { storyFlags: ['voltspire_amateur_won'] },
    inventory: {
      items: ['repair_kit', 'large_repair_kit', 'shield_cell', 'overclock', 'small_battery_kit', 'battery_kit', 'heavy_battery_kit'],
      weapons: ['iron_fist', 'rail_carbine', 'thunder_rod', 'tideblade', 'magma_coil'],
      disks: ['stat_atk_2', 'stat_def_2', 'stat_spd_2', 'atk_disk_jab', 'atk_disk_heavy'],
      batteries: ['reinforced_cell', 'heavy_cell', 'industrial_cell', 'tournament_cell'],
    },
    sellMultiplier: 0.55,
  },

  // ============ Bay grind zones ============
  {
    id: 'holl_bay_shallows',
    cityId: 'hollowmere',
    name: 'The Bay Shallows',
    kind: 'grind_place',
    shortDesc: 'Beginner water wilds, LV 5-10.',
    desc: 'Tidal pools and low-water flats just outside the harbor. Wild water mechas wander in with the tide.',
    requires: { storyFlags: ['holl_shallows_unlocked'] },
    spawnPool: [
      { modelId: 'shore_drone', minLevel: 5,  maxLevel: 8 },
      { modelId: 'brinekit',    minLevel: 6,  maxLevel: 9 },
      { modelId: 'reefling',    minLevel: 7,  maxLevel: 10 },
    ],
    materialPool: ['scrap_metal', 'salvaged_plate', 'pressure_seal'],
    diskDropChance: 0.15,
    diskPool: ['stat_atk_2', 'stat_def_2'],
  },
  {
    id: 'holl_bay_depths',
    cityId: 'hollowmere',
    name: 'The Bay Depths',
    kind: 'grind_place',
    shortDesc: 'Deep-water wilds, LV 10-16. Rares possible.',
    desc: 'Past the harbor mouth, where the bay floor drops. Bigger frames here, including rare deep-pressure hunters.',
    requires: { storyFlags: ['holl_depths_unlocked'] },
    spawnPool: [
      { modelId: 'tidewall',       minLevel: 10, maxLevel: 13 },
      { modelId: 'riptide_runner', minLevel: 11, maxLevel: 14 },
      { modelId: 'hydra_jr',       minLevel: 12, maxLevel: 15 },
      { modelId: 'storm_marlin',   minLevel: 14, maxLevel: 16 },
    ],
    materialPool: ['scrap_metal', 'pressure_seal', 'rare_alloy'],
    diskDropChance: 0.25,
    diskPool: ['stat_atk_2', 'stat_def_2', 'stat_spd_2', 'atk_disk_heavy'],
  },

  // ============ MFC Tower ============
  // The heart of the city. Houses tier-up exams and the highest-tier
  // tournaments. Gates require fame, medals, and a gatekeeper defeat per tier.
  {
    id: 'holl_mfc',
    cityId: 'hollowmere',
    name: 'The MFC Tower',
    kind: 'tournament',
    shortDesc: 'Mecha Fighting Club. Tier-up exams here.',
    desc: 'A vast spire of concrete and glass at the harbor mouth. The Mecha Fighting Club registers every serious trainer in the world. Three tier gates wait at the entry desk: Official, Professional, Elite. Each has its own examination, its own price of admission, and its own gatekeeper waiting somewhere out there.',
    requires: { storyFlags: ['voltspire_amateur_won'] },
    tournamentIds: ['mfc_official_test', 'mfc_pro_test', 'mfc_elite_test', 'mfc_inter_faction'],
  },

  // ============ Local tournaments (open per-tier) ============
  {
    id: 'holl_tournament_local',
    cityId: 'hollowmere',
    name: 'Hollowmere Arena',
    kind: 'tournament',
    shortDesc: 'Local tournaments — amateur, official, pro, elite.',
    desc: 'A coastal arena overlooking the bay. Hollowmere\'s own circuit. The amateur cup runs year-round; the rest open with your tier.',
    requires: { storyFlags: ['voltspire_amateur_won'] },
    tournamentIds: ['hollowmere_amateur', 'hollowmere_official', 'hollowmere_pro', 'hollowmere_elite'],
  },

  // ============ Hollowmere gatekeeper ============
  // Pro-tier MFC gate. Lives here in Hollowmere (water specialist).
  // Unlocked after passing the MFC Official Test.
  {
    id: 'holl_pro_gatekeeper',
    cityId: 'hollowmere',
    name: "Marisol's Pier",
    kind: 'fight_story',
    shortDesc: 'MFC Pro-tier gatekeeper.',
    desc: 'A weather-beaten pier on the east end of the harbor. Marisol Deep-Water keeps three water frames in floating cradles. She nods at you. "You\'ve passed Official. Good. Now show me you belong in Pro."',
    requires: { storyFlags: ['mfc_official_passed'] },
  },

  // ============ Side quest unlock for grinding ============
  // Talk to the dockmaster, who explains the bay zones and tells you about
  // the trouble with the Hollow Leviathan (a side-quest boss). Sets the
  // flags that unlock the two grind zones.
  {
    id: 'holl_dockmaster',
    cityId: 'hollowmere',
    name: "The Dockmaster's Office",
    kind: 'story_place',
    shortDesc: 'Local intel. Side quests. Bay grind unlock.',
    desc: 'A weather-stained office at the harbor. The Dockmaster, an ex-trainer with one mechanical arm, waves you in. "First time in Hollowmere? Let me brief you on the bay. The shallows are safe — go grind. The depths, less so. Something\'s been stirring out there. If you want to clear it, talk to me about the Leviathan."',
    requires: { storyFlags: ['voltspire_amateur_won'] },
  },

  // ============ Faction headquarters (presidents) ============
  // Each faction has its world HQ here. Faction president challenges live here.
  {
    id: 'holl_natures',
    cityId: 'hollowmere',
    name: "Nature's Own Sanctum",
    kind: 'faction_house',
    factionId: 'naturesOwn',
    shortDesc: 'Faction HQ · Saren Greenwall.',
    desc: 'A grove-temple built into the cliffside above the harbor. Saren Greenwall is the world president of Nature\'s Own. He fights at elite tier.',
    requires: { storyFlags: ['voltspire_amateur_won'] },
    challengeCoachIds: [],
  },
  {
    id: 'holl_elemental',
    cityId: 'hollowmere',
    name: 'The Elementalist Convergence',
    kind: 'faction_house',
    factionId: 'elementalists',
    shortDesc: 'Faction HQ · Karro Maelstrom.',
    desc: 'A circle of stone pillars on the outer bay. Karro Maelstrom — world president of the Elementalists — fights at elite tier.',
    requires: { storyFlags: ['voltspire_amateur_won'] },
    challengeCoachIds: [],
  },
  {
    id: 'holl_industrial',
    cityId: 'hollowmere',
    name: 'The Industrial Tower',
    kind: 'faction_house',
    factionId: 'industrials',
    shortDesc: 'Faction HQ · Garrick Steelvein.',
    desc: 'A black skyscraper at the harbor. Garrick Steelvein — world president of the Industrials — fights at elite tier.',
    requires: { storyFlags: ['voltspire_amateur_won'] },
    challengeCoachIds: [],
  },
];
