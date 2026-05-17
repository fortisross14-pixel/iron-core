/**
 * IRONHAVEN — village places. Industrial foundry village. Steel-themed.
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
    desc: 'Your room is small but tidy. A poster of last year\'s Apex champion is taped to the wall. Out the window, the foundry chimneys are smoking — same as every morning.',
  },
  {
    id: 'iron_workshop',
    cityId: 'ironhaven',
    name: "Uncle's Workshop",
    kind: 'story_place',
    shortDesc: "Your uncle's mecha shop. Free repairs.",
    desc: "Your uncle Ferro\'s workshop smells like ozone, machine oil, and pipe tobacco. He builds, repairs, and re-tunes mechas for the whole village. He keeps a kettle on a hot plate by the door. Always.",
  },
  {
    id: 'iron_market',
    cityId: 'ironhaven',
    name: 'Ironhaven Market',
    kind: 'store',
    shortDesc: 'Stalls along the main street. Basics only.',
    desc: 'A handful of stalls along the main street. Weapons, armor, disks, repair kits — nothing fancy. Mostly steel-frame parts since that\'s what wanders the junkyard.',
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
    shortDesc: 'Your old high school. Senior Cup arena.',
    desc: "The Academy where you finished school last spring. There's a small tournament yard out back where graduating seniors face off every year. Principal Halward still runs the Senior Cup himself.",
    tournamentIds: ['senior_cup'],
  },
  {
    id: 'iron_gate',
    cityId: 'ironhaven',
    name: "Smelter's Gate",
    kind: 'fight_story',
    shortDesc: 'The road east. Watched by Krait.',
    desc: 'The east road out of Ironhaven, past the smelter. Krait the Toll-Taker leans against the gate post most days, charging a toll on anyone who wants to leave the village. No one\'s beaten him in three years.',
    battleSceneId: 'krait_first_fight',
  },
  {
    id: 'iron_junkyard',
    cityId: 'ironhaven',
    name: 'The Junkyard',
    kind: 'grind_place',
    shortDesc: 'Abandoned factory frames. LV 1. All steel-type.',
    desc: 'The scrap field behind the foundry. Old steel-frame mechas wander here — workers that broke down on the line and got dumped. Half-feral, all rusted, but a good place to start.',
    requires: { storyFlags: ['krait_defeated_player'] },
    spawnPool: [
      { modelId: 'scrap_grunt', minLevel: 1, maxLevel: 1 },
      { modelId: 'rust_husk',   minLevel: 1, maxLevel: 1 },
      { modelId: 'rivet_kin',   minLevel: 1, maxLevel: 1 },
    ],
    materialPool: ['scrap_metal', 'copper_wire', 'salvaged_plate'],
    diskDropChance: 0.10,
    diskPool: ['stat_atk_1', 'stat_def_1'],
  },
];
