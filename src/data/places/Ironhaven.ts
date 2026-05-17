/**
 * IRONHAVEN — village places.
 * Tier: village → small store, one grind place, no faction houses,
 *       only amateur tournaments + 1 official slot reserved for later.
 */

import type { Place } from './types';

export const IRONHAVEN_PLACES: Place[] = [
  {
    id: 'iron_home',
    cityId: 'ironhaven',
    name: 'Your House',
    kind: 'story_place',
    shortDesc: 'Where you grew up.',
    desc: 'Your room is small. There is a poster of the last Apex champion on the wall.',
  },
  {
    id: 'iron_workshop',
    cityId: 'ironhaven',
    name: "Uncle's Workshop",
    kind: 'story_place',
    shortDesc: "Your uncle's mecha shop.",
    desc: "Your uncle's workshop smells like ozone and machine oil. He builds mechs here on commission.",
  },
  {
    id: 'iron_market',
    cityId: 'ironhaven',
    name: 'Ironhaven Market',
    kind: 'store',
    shortDesc: 'Buy and sell.',
    desc: 'A handful of stalls along the main street. Weapons, armor, disks, repair kits.',
    inventory: {
      items: ['repair_kit', 'small_battery_kit', 'battery_kit'],
      weapons: ['iron_fist'],
      disks: ['stat_atk_1', 'stat_def_1', 'atk_disk_strike'],
      batteries: ['reinforced_cell'],
    },
    sellMultiplier: 0.4,
  },
  {
    id: 'iron_academy',
    cityId: 'ironhaven',
    name: 'Ironhaven Academy',
    kind: 'tournament',
    shortDesc: 'Your old high school.',
    desc: "The high school. There's a small tournament arena out back where graduating seniors face off.",
    tournamentIds: ['senior_cup'],
  },
  {
    id: 'iron_gate',
    cityId: 'ironhaven',
    name: "Smelter's Gate",
    kind: 'fight_story',
    shortDesc: 'The road out of town.',
    desc: 'The east road out of Ironhaven. A heavy-set man is leaning against the gate post.',
    battleSceneId: 'krait_first_fight',
  },
  {
    id: 'iron_junkyard',
    cityId: 'ironhaven',
    name: 'The Junkyard',
    kind: 'grind_place',
    shortDesc: 'Train against abandoned mechs.',
    desc: 'A scrap field outside town. Old abandoned mechas wander here, half-feral.',
    requires: { storyFlags: ['krait_defeated_player'] },
    spawnPool: [
      { modelId: 'scrap_grunt', minLevel: 1, maxLevel: 1 },
      { modelId: 'rust_husk',   minLevel: 1, maxLevel: 1 },
      { modelId: 'feral_grub',  minLevel: 1, maxLevel: 1 },
    ],
    materialPool: ['scrap_metal', 'copper_wire', 'salvaged_plate'],
    diskDropChance: 0.10,
    diskPool: ['stat_atk_1', 'stat_def_1'],
  },
];
