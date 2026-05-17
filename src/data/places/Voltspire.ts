/**
 * VOLTSPIRE — town places. Lightning-themed.
 *
 * Story flow:
 *   1. Arrive (`krait_rematch_won`) → Square + Market + 3 faction houses + Lounge open.
 *      Tournament Hall is visible but has only the amateur tournament open.
 *   2. Visit each faction house: they tell you their story, you can't join yet.
 *      Each faction visit sets a flag (`volt_natures_visited`, etc).
 *      All three visited → `volt_factions_all_visited` is set by reducer logic.
 *   3. Visit the Bronze Champion in his Lounge. He fights you (probable loss),
 *      then unlocks the two Storm Fields grind zones. Flag: `volt_lounge_intro_done`.
 *   4. With all factions visited, the Gatekeeper place activates on the Square.
 *      Defeat the Gatekeeper → `volt_gatekeeper_defeated` → factions joinable.
 *   5. Sign with a faction → `faction_signed` → faction-quest fight unlocked.
 *   6. Win Voltspire Amateur Tournament → unlock Bronze Champion's House
 *      (free heal, mentor dialogue), and unlock Hollowmere + Emberbold on world map.
 *   7. Official / Pro tournaments here are visible-but-locked until tier matches.
 */

import type { Place } from './types';

export const VOLTSPIRE_PLACES: Place[] = [
  {
    id: 'volt_square',
    cityId: 'voltspire',
    name: 'Voltspire Square',
    kind: 'story_place',
    shortDesc: 'The plaza. All roads meet here.',
    desc: 'The city center. Storm pylons crackle overhead. Three faction houses ring the plaza, each with its banner snapping in the electric wind.',
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

  // ============ Faction houses — visit-able from the start ============
  // Visiting each one sets a story flag; once all three are visited the
  // gatekeeper unlocks. Joining requires defeating the gatekeeper first.
  {
    id: 'volt_natures',
    cityId: 'voltspire',
    name: "Nature's Own Grove",
    kind: 'faction_house',
    factionId: 'naturesOwn',
    shortDesc: "Faction house · Nature's Own.",
    desc: 'A walled garden inside the city. Old bio-frames graze in the back. The Grove-Keeper greets you warmly. "Sit. I\'ll tell you what we stand for. But before you ask — no, we can\'t sign you until you\'ve passed the gatekeeper. Talk to the other two as well, then go find Halloran. He waits past the eastern arch."',
    requires: { storyFlags: ['krait_rematch_won'] },
    challengeCoachIds: [],
  },
  {
    id: 'volt_elemental',
    cityId: 'voltspire',
    name: 'The Elementalist Camp',
    kind: 'faction_house',
    factionId: 'elementalists',
    shortDesc: 'Faction house · The Elementalists.',
    desc: 'A circle of wagons just inside the western wall. Smoke, water-pumps, salt-burned banners. Their spokesperson talks fast: "We\'re the wildest of the three, and proud of it. You want to know more? Then come back when you\'ve fought Halloran. We don\'t talk paperwork before the gatekeeper. Visit the others too, while you\'re at it."',
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
    desc: 'A clean stone building with a brass door. A receptionist takes your name on a paper ledger. "Industrials sign no one who hasn\'t passed Halloran. He\'s by the eastern arch, past the storm-pylon row. Make sure you\'ve heard what the other two factions have to say first — we don\'t want regrets."',
    requires: { storyFlags: ['krait_rematch_won'] },
    challengeCoachIds: [],
  },

  // ============ The Bronze Champion's Lounge — story hub ============
  // Open from the start. Visiting it sparks an intro fight with the Bronze
  // Champion. On loss (likely), he unlocks the grind zones. On win, he's
  // pleasantly surprised and still unlocks them.
  {
    id: 'volt_lounge',
    cityId: 'voltspire',
    name: "The Bronze Lounge",
    kind: 'fight_story',
    shortDesc: "Trainer's hangout. Free advice. Hard sparring.",
    desc: 'A low-ceilinged hall behind the market. Off-duty trainers play cards and trade scrap. The Bronze Champion — Renn Quickstep — keeps a corner table here. He looks up when you walk in. "New face. Want a sparring match? I\'ll go easy. If you can hold your own, I\'ll tell you where to grind."',
    requires: { storyFlags: ['krait_rematch_won'] },
  },

  // ============ Storm Fields — grind zones ============
  // Unlocked after the Bronze Lounge intro. Two zones for tier-appropriate
  // grinding before/after the gatekeeper fight.
  {
    id: 'volt_storm_fields_basic',
    cityId: 'voltspire',
    name: 'The Outer Storm Fields',
    kind: 'grind_place',
    shortDesc: 'Beginner lightning wilds, LV 3-5.',
    desc: 'Just past the eastern wall. Loose lightning mechas drift between the pylons, mostly young or damaged frames. Renn says this is where everyone starts.',
    requires: { storyFlags: ['volt_lounge_intro_done'] },
    spawnPool: [
      { modelId: 'brittle_charge', minLevel: 3, maxLevel: 5 },
      { modelId: 'sparkfly',       minLevel: 3, maxLevel: 5 },
      { modelId: 'conduit_pup',    minLevel: 3, maxLevel: 5 },
    ],
    materialPool: ['scrap_metal', 'copper_wire', 'lightning_capacitor'],
    diskDropChance: 0.10,
    diskPool: ['stat_atk_1', 'stat_spd_1'],
  },
  {
    id: 'volt_storm_fields_deep',
    cityId: 'voltspire',
    name: 'The Inner Storm Fields',
    kind: 'grind_place',
    shortDesc: 'Stronger lightning wilds, LV 5-10. Rares possible.',
    desc: 'Deeper into the pylon network where the air smells like ozone constantly. Bigger frames here, and rumors of rare hunter mechas that pack-hunt the lightning paths.',
    requires: { storyFlags: ['volt_lounge_intro_done'] },
    spawnPool: [
      { modelId: 'storm_cur',      minLevel: 5, maxLevel: 8 },
      { modelId: 'arc_marauder',   minLevel: 6, maxLevel: 9 },
      { modelId: 'thunder_owl',    minLevel: 7, maxLevel: 10 },
    ],
    materialPool: ['scrap_metal', 'copper_wire', 'lightning_capacitor', 'rare_circuit'],
    diskDropChance: 0.20,
    diskPool: ['stat_atk_2', 'stat_spd_2', 'atk_disk_spark'],
  },

  // ============ The Gatekeeper ============
  // Unlocks after visiting all three faction houses. Beating him opens
  // faction joining.
  {
    id: 'volt_gatekeeper',
    cityId: 'voltspire',
    name: "Halloran's Post",
    kind: 'fight_story',
    shortDesc: 'The gatekeeper. Pass him to join a faction.',
    desc: 'An old wood pavilion at the eastern arch. Halloran "The Toll" sits in the only chair, polishing a battery housing. Three lightning mechas idle behind him in repair cradles. He looks up. "So. The factions sent you. Show me what you\'ve got, kid."',
    requires: { storyFlags: ['volt_factions_all_visited'] },
  },

  // ============ Tournament Hall ============
  // Three tournaments here: amateur is open immediately, official and pro
  // are visible-but-locked behind tier gates.
  {
    id: 'volt_tournament',
    cityId: 'voltspire',
    name: 'The Circuit',
    kind: 'tournament',
    shortDesc: 'Voltspire arena. Three leagues.',
    desc: "The eastern hub of the lightning circuit. Storm-pylons hum directly over the arena floor. Amateurs run year-round; official and pro events open when you've earned your tier.",
    requires: { storyFlags: ['krait_rematch_won'] },
    tournamentIds: ['voltspire_amateur', 'voltspire_official', 'voltspire_pro'],
  },

  // ============ Bronze Champion's House ============
  // Unlocked after winning Voltspire Amateur. Acts as a free workshop heal
  // + dialogue hub + the place Renn tells you about Hollowmere and Emberbold.
  {
    id: 'volt_champ_house',
    cityId: 'voltspire',
    name: "Renn's House",
    kind: 'story_place',
    shortDesc: "Bronze Champion's place. Free repairs, advice, intel.",
    desc: 'A modest house north of the square, with three lightning frames standing in the yard. Renn welcomes you in. "You earned this. Sit down. Let me top off your bots — on the house. Then we should talk. There\'s more cities than just this one, you know."',
    requires: { storyFlags: ['voltspire_amateur_won'] },
  },
];
