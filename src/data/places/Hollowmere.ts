/**
 * HOLLOWMERE — city tier.
 * Largest market, Officials' Hall (tier tests), multi-tier tournament hall.
 * Faction Houses with PRESIDENT fights — the gating step before the
 * Inter-Faction Championship.
 */

import type { Place } from './types';

export const HOLLOWMERE_PLACES: Place[] = [
  {
    id: 'holl_square',
    cityId: 'hollowmere',
    name: 'Hollowmere Square',
    kind: 'story_place',
    shortDesc: 'The plaza. Gulls overhead.',
    desc: 'A wide stone plaza overlooking the bay. The Officials\' Hall stands on the north side, three storeys of pale brick.',
    requires: { storyFlags: ['halloran_defeated'] },
  },
  {
    id: 'holl_market',
    cityId: 'hollowmere',
    name: 'Hollowmere Market',
    kind: 'store',
    shortDesc: 'Coastal trade market.',
    desc: 'The largest open-air market on the coast. Imports, rare disks, custom armor.',
    requires: { storyFlags: ['halloran_defeated'] },
    inventory: {
      items: ['repair_kit', 'shield_cell', 'overclock', 'battery_kit', 'heavy_battery_kit'],
      weapons: ['rail_carbine', 'cinder_cannon', 'tide_blaster', 'thunder_rod', 'cryo_coil'],
      disks: ['stat_atk_2', 'stat_def_2', 'stat_spd_2', 'atk_disk_ember', 'atk_disk_jet', 'atk_disk_frost'],
      batteries: ['industrial_cell', 'tournament_cell', 'legendary_core'],
    },
    sellMultiplier: 0.6,
  },
  {
    id: 'holl_officials',
    cityId: 'hollowmere',
    name: "The Officials' Hall",
    kind: 'tournament',
    shortDesc: 'Tier test, Inter-Faction, Ultimate.',
    desc: 'The eastern registry of the official circuit. Examiners hold court here year-round. Walls lined with brass plaques.',
    requires: { storyFlags: ['halloran_defeated'] },
    tournamentIds: ['official_test', 'inter_faction', 'ultimate'],
  },

  // ============ FACTION HOUSES (with president fights) ============
  {
    id: 'holl_natures',
    cityId: 'hollowmere',
    name: "Nature's Own Grand Grove",
    kind: 'faction_house',
    factionId: 'naturesOwn',
    shortDesc: "The seat of Nature's Own.",
    desc: 'The main grove of the faction. Older bio-frames doze in moss-walled pens. The Council meets here when it needs to be quiet.',
    requires: { storyFlags: ['halloran_defeated'] },
    challengeCoachIds: [],
    presidentCoachId: 'pres_naturesOwn',
  },
  {
    id: 'holl_elemental',
    cityId: 'hollowmere',
    name: 'The Elementalist Convergence',
    kind: 'faction_house',
    factionId: 'elementalists',
    shortDesc: 'The seat of the Elementalists.',
    desc: 'The Convergence — a tide-built amphitheater on the dock side. The faction\'s standing camp when it isn\'t roaming the coasts.',
    requires: { storyFlags: ['halloran_defeated'] },
    challengeCoachIds: [],
    presidentCoachId: 'pres_elementalists',
  },
  {
    id: 'holl_industrial',
    cityId: 'hollowmere',
    name: 'The Industrial Tower',
    kind: 'faction_house',
    factionId: 'industrials',
    shortDesc: 'The seat of the Industrials.',
    desc: 'A six-storey foundry-office. The presidential floor is up top. The lobby smells of brass polish and quarterly returns.',
    requires: { storyFlags: ['halloran_defeated'] },
    challengeCoachIds: [],
    presidentCoachId: 'pres_industrials',
  },
];
