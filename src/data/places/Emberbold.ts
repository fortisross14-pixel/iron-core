/**
 * EMBERBOLD — volcanic town. Fire-themed. Town-tier (#4).
 *
 * Unlock: `voltspire_amateur_won` (told by Renn after Bronze).
 *
 * Structure:
 *   - Square, Market, two fire grind zones (foothills + caldera)
 *   - Amateur tournament (open), Official tournament (tier-locked),
 *     Pro tournament (tier-locked). No Elite here.
 *   - MFC Official-tier gatekeeper lives here (fire specialist).
 *   - Side quest: a Magma Drake roams the foothills. Fighting it triggers a
 *     designed-loss fight; an NPC then explains the deeper caldera grind unlock.
 */

import type { Place } from './types';

export const EMBERBOLD_PLACES: Place[] = [
  {
    id: 'ember_square',
    cityId: 'emberbold',
    name: 'Emberbold Square',
    kind: 'story_place',
    shortDesc: 'Plaza carved into black volcanic stone.',
    desc: "The plaza is built on the rim of an old lava tube. Heat shimmers up from grates in the floor. To the north the caldera glows orange after dusk. Forges hum nonstop somewhere below your feet.",
    requires: { storyFlags: ['voltspire_amateur_won'] },
  },
  {
    id: 'ember_market',
    cityId: 'emberbold',
    name: 'Emberbold Forge-Market',
    kind: 'store',
    shortDesc: 'Forge-craft weapons. Heat-rated batteries.',
    desc: 'Emberbold\'s forges produce some of the world\'s best fire-rated gear. The market stalls run on geothermal vents.',
    requires: { storyFlags: ['voltspire_amateur_won'] },
    inventory: {
      items: ['repair_kit', 'large_repair_kit', 'shield_cell', 'overclock', 'small_battery_kit', 'battery_kit', 'heavy_battery_kit'],
      weapons: ['iron_fist', 'rail_carbine', 'thunder_rod', 'magma_coil'],
      disks: ['stat_atk_2', 'stat_def_2', 'stat_spd_2', 'atk_disk_heavy'],
      batteries: ['reinforced_cell', 'heavy_cell', 'industrial_cell'],
    },
    sellMultiplier: 0.55,
  },

  // ============ Grind zones ============
  // First zone unlocks just by visiting the side-quest NPC. Second zone
  // unlocks after the Magma Drake "lesson" fight.
  {
    id: 'ember_foothills',
    cityId: 'emberbold',
    name: 'The Cinder Foothills',
    kind: 'grind_place',
    shortDesc: 'Beginner fire wilds, LV 5-10.',
    desc: 'Black slopes outside the eastern wall. Wild fire mechas wander among the cinder cones, mostly young or feral.',
    requires: { storyFlags: ['ember_foothills_unlocked'] },
    spawnPool: [
      { modelId: 'emberpup',     minLevel: 5,  maxLevel: 8 },
      { modelId: 'cinderboar',   minLevel: 6,  maxLevel: 9 },
      { modelId: 'smokebat',     minLevel: 7,  maxLevel: 10 },
    ],
    materialPool: ['scrap_metal', 'salvaged_plate', 'heat_shielding'],
    diskDropChance: 0.15,
    diskPool: ['stat_atk_2', 'stat_spd_2'],
  },
  {
    id: 'ember_caldera',
    cityId: 'emberbold',
    name: 'The Caldera Rim',
    kind: 'grind_place',
    shortDesc: 'Higher-tier fire wilds, LV 10-16. Rares possible.',
    desc: 'The rim of the active caldera. The heat is unbearable for unprotected mechas, and the wild frames here are battle-hardened — they fight off the Magma Drake for territory.',
    requires: { storyFlags: ['ember_caldera_unlocked'] },
    spawnPool: [
      { modelId: 'forge_walker',  minLevel: 10, maxLevel: 13 },
      { modelId: 'magma_lizard',  minLevel: 11, maxLevel: 14 },
      { modelId: 'furnace_hound', minLevel: 12, maxLevel: 15 },
      { modelId: 'flame_phoenix', minLevel: 14, maxLevel: 16 },
    ],
    materialPool: ['scrap_metal', 'heat_shielding', 'rare_alloy'],
    diskDropChance: 0.25,
    diskPool: ['stat_atk_2', 'stat_def_2', 'stat_spd_2', 'atk_disk_heavy'],
  },

  // ============ Side-quest NPC ============
  // Visiting this place unlocks the foothills (basic grind).
  // Initiating the Magma Drake fight from here triggers the designed-loss
  // boss fight; on completion (win or loss) the caldera grind unlocks.
  {
    id: 'ember_dragon_hunter',
    cityId: 'emberbold',
    name: "The Drake-Hunter's Camp",
    kind: 'fight_story',
    shortDesc: 'Side quest: the Magma Drake. Grind unlocks.',
    desc: 'A wind-burned tent on the foothill road. Inside, a one-armed ex-hunter named Talo Embershell mends rope. He looks up. "First time? The foothills are safe — grind there freely. Want a bigger story? The Drake is up the caldera. I\'ve fought him. I lost. But I learned where to grind on the way back. Want to try?"',
    requires: { storyFlags: ['voltspire_amateur_won'] },
  },

  // ============ Local tournaments ============
  {
    id: 'ember_tournament',
    cityId: 'emberbold',
    name: 'The Forge Arena',
    kind: 'tournament',
    shortDesc: 'Amateur, Official, Pro tournaments.',
    desc: 'A circular arena cut directly into volcanic rock. The amateur cup runs year-round; the rest open with your tier.',
    requires: { storyFlags: ['voltspire_amateur_won'] },
    tournamentIds: ['emberbold_amateur', 'emberbold_official', 'emberbold_pro'],
  },

  // ============ Official-tier MFC gatekeeper ============
  // Lives here, fights with fire mechas. Beating him is one of the three
  // gates for MFC Official-tier registration.
  {
    id: 'ember_official_gatekeeper',
    cityId: 'emberbold',
    name: "Korin's Forge",
    kind: 'fight_story',
    shortDesc: 'MFC Official-tier gatekeeper.',
    desc: 'A private forge on the southern slope. Korin Cinderforge — a former Pro who turned gatekeeper — works a blade at his anvil. "You came from Hollowmere? The MFC sent you to me. Good. Show me you\'re ready for Official."',
    requires: { storyFlags: ['mfc_official_test_started'] },
  },
];
