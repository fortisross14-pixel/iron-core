/**
 * VOLTSPIRE — town places.
 * Tier: town → medium market, two grind places, three faction houses,
 *       tournaments include amateur + official + pro (pro is visible-but-locked).
 */

import type { Place } from './types';

export const VOLTSPIRE_PLACES: Place[] = [
  {
    id: 'volt_square',
    cityId: 'voltspire',
    name: 'Voltspire Square',
    kind: 'story_place',
    shortDesc: 'The plaza. All roads meet here.',
    desc: 'The city center. Storm pylons crackle overhead. Three faction houses ring the plaza.',
    requires: { storyFlags: ['krait_rematch_won'] },
  },
  {
    id: 'volt_market',
    cityId: 'voltspire',
    name: 'Voltspire Market',
    kind: 'store',
    shortDesc: 'Bigger market. Better stock.',
    desc: 'Better selection than Ironhaven. Real weapons, rare disks, contract chips for new chassis.',
    requires: { storyFlags: ['krait_rematch_won'] },
    inventory: {
      items: ['repair_kit', 'shield_cell', 'overclock', 'small_battery_kit', 'battery_kit', 'heavy_battery_kit'],
      weapons: ['iron_fist', 'rail_carbine', 'thunder_rod'],
      disks: ['stat_atk_1', 'stat_def_1', 'stat_spd_1', 'stat_atk_2', 'atk_disk_jab', 'atk_disk_spark'],
      batteries: ['reinforced_cell', 'heavy_cell', 'industrial_cell'],
    },
    sellMultiplier: 0.5,
  },
  {
    id: 'volt_tournament',
    cityId: 'voltspire',
    name: 'Voltspire Tournament Hall',
    kind: 'tournament',
    shortDesc: 'Official tournament registration.',
    desc: "The official circuit's eastern hub. Bronze through Gold leagues run here every season.",
    requires: { storyFlags: ['krait_rematch_won'] },
    tournamentIds: ['voltspire_bronze', 'voltspire_apex', 'voltspire_silver'],
  },
  {
    id: 'volt_natures',
    cityId: 'voltspire',
    name: "Nature's Own Grove",
    kind: 'faction_house',
    factionId: 'naturesOwn',
    shortDesc: "Faction house · Nature's Own.",
    desc: 'A walled garden inside the city. Old bio-frames graze in the back. The Grove-Keeper greets you without standing up.',
    requires: { storyFlags: ['krait_rematch_won'] },
    challengeCoachIds: [],  // populated later when Step 3b faction system ships
  },
  {
    id: 'volt_elemental',
    cityId: 'voltspire',
    name: 'The Elementalist Camp',
    kind: 'faction_house',
    factionId: 'elementalists',
    shortDesc: 'Faction house · The Elementalists.',
    desc: 'A circle of wagons just inside the western wall. Smoke, water-pumps, salt-burned banners.',
    requires: { storyFlags: ['krait_rematch_won'] },
    challengeCoachIds: [],
  },
  {
    id: 'volt_industrial',
    cityId: 'voltspire',
    name: 'The Industrial Hall',
    kind: 'faction_house',
    factionId: 'industrials',
    shortDesc: 'Faction house · The Industrials.',
    desc: 'A clean stone building with a brass door. A receptionist takes your name on a paper ledger.',
    requires: { storyFlags: ['krait_rematch_won'] },
    challengeCoachIds: [],
  },
];
