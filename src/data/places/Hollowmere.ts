/**
 * HOLLOWMERE — city tier.
 * Largest market, Officials' Hall (tier tests), multi-tier tournament hall.
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
      items: ['repair_kit', 'shield_cell', 'overclock'],
      weapons: ['rail_carbine', 'cinder_cannon', 'tide_blaster', 'thunder_rod', 'cryo_coil'],
      disks: ['stat_atk_2', 'stat_def_2', 'stat_spd_2', 'atk_disk_ember', 'atk_disk_jet', 'atk_disk_frost'],
    },
    sellMultiplier: 0.6,
  },
  {
    id: 'holl_officials',
    cityId: 'hollowmere',
    name: "The Officials' Hall",
    kind: 'tournament',          // It hosts tier tests, which use the same MultiFightEvent system
    shortDesc: 'Take the Official Test.',
    desc: 'The eastern registry of the official circuit. Examiners hold court here year-round. Walls lined with brass plaques.',
    requires: { storyFlags: ['halloran_defeated'] },
    // tier tests are accessed by id from /data/tests.ts via the existing hall view
    tournamentIds: ['official_test'],
  },
];
