/**
 * MODELS — the mecha dex.
 *
 * 8 types × 12 + 3 god types = 99 entries.
 *
 * Per type:
 *   4 common, 3 uncommon, 2 rare, 2 epic, 1 legendary
 *
 * God types are tier-9 mythical and override all type effectiveness rules.
 *
 * Each model auto-learns 5 attacks total over its lifetime:
 *   level 1  — defaultAttacks (basic_strike + type_t1)
 *   level 2  — type's t2 attack
 *   level 5  — type's t3 attack
 *   level 10 — type's t4 attack
 *   level 20 — type's t5 attack
 *   level 30 — bonus from a strongest pool (varies by rarity, set per-mecha)
 *
 * The schema and helper here mean you only need to specify the cosmetic
 * fields (name, flavor) and the stat vector. Everything else is auto-derived
 * from type+rarity.
 *
 * To rename a mecha: edit the `surname` field below.
 * To change stats:   edit baseStats.
 * To override attack progression: add learnedAt explicitly on that entry.
 */

import type { MechaType } from './types';

export type Rarity = 'starter' | 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary' | 'god';

export interface BaseStats {
  attack: number;
  defense: number;
  speed: number;
  intelligence: number;
}

export interface LevelLearnedAttack {
  level: number;
  attackId: string;
}

export interface ModelData {
  id: string;
  dexNo: number;
  surname: string;
  type: MechaType;
  rarity: Rarity;
  role: string;
  acquisition: string;
  price?: number;
  baseStats: BaseStats;
  maxHp: number;
  defaultAttacks: string[];
  learnedAt?: LevelLearnedAttack[];
  flavor: string;
  /** Short pithy in-character line shown on the card. One sentence, all caps recommended. */
  quote?: string;
}

export const RARITY_INFO: Record<Rarity, { name: string; color: string }> = {
  starter:   { name: 'Starter',   color: '#7df0ff' },
  common:    { name: 'Common',    color: '#888' },
  uncommon:  { name: 'Uncommon',  color: '#7fb069' },
  rare:      { name: 'Rare',      color: '#5fa8ff' },
  epic:      { name: 'Epic',      color: '#c896ff' },
  legendary: { name: 'Legendary', color: '#ffd700' },
  god:       { name: 'God-Type',  color: '#ff5fee' },
};

/** Total dex slots. 8 types × 12 + 3 god types = 99. */
export const TOTAL_DEX = 99;

// ============================================================
// Per-type attack progression. Each type teaches its t2-t5 attacks
// at levels 2/5/10/20. Level 30 is reserved for the signature-equivalent
// strongest finisher (per-model can override).
// ============================================================

const PROGRESSION_BY_TYPE: Record<MechaType, LevelLearnedAttack[]> = {
  fire:      [
    { level: 2,  attackId: 'ember_punch' },
    { level: 5,  attackId: 'cinder_burst' },
    { level: 10, attackId: 'fire_t4' },
    { level: 20, attackId: 'fire_t5' },
  ],
  water:     [
    { level: 2,  attackId: 'water_jet' },
    { level: 5,  attackId: 'tide_cannon' },
    { level: 10, attackId: 'water_t4' },
    { level: 20, attackId: 'water_t5' },
  ],
  lightning: [
    { level: 2,  attackId: 'spark' },
    { level: 5,  attackId: 'thunderfork' },
    { level: 10, attackId: 'lightning_t4' },
    { level: 10, attackId: 'replenish_charge' }, // Lightning-only support move; ally-targeted battery transfer
    { level: 20, attackId: 'lightning_t5' },
  ],
  ice:       [
    { level: 2,  attackId: 'frost_jab' },
    { level: 5,  attackId: 'frostbite' },
    { level: 10, attackId: 'ice_t4' },
    { level: 20, attackId: 'ice_t5' },
  ],
  earth:     [
    { level: 2,  attackId: 'stone_fist' },
    { level: 5,  attackId: 'quake_slam' },
    { level: 10, attackId: 'earth_t4' },
    { level: 20, attackId: 'earth_t5' },
  ],
  bio:       [
    { level: 2,  attackId: 'spore_lash' },
    { level: 5,  attackId: 'rot_touch' },
    { level: 10, attackId: 'bio_t4' },
    { level: 20, attackId: 'bio_t5' },
  ],
  steel:     [
    { level: 2,  attackId: 'rivet_punch' },
    { level: 5,  attackId: 'piston_slam' },
    { level: 10, attackId: 'steel_t4' },
    { level: 20, attackId: 'steel_t5' },
  ],
  mental:    [
    { level: 2,  attackId: 'neurospike' },
    { level: 5,  attackId: 'mind_lance' },
    { level: 10, attackId: 'mental_t4' },
    { level: 20, attackId: 'mental_t5' },
  ],
};

/** The default tier-1 attack for each type (level-1 starter move). */
const DEFAULT_T1: Record<MechaType, string> = {
  fire: 'fire_t1', water: 'water_t1', lightning: 'lightning_t1', ice: 'ice_t1',
  earth: 'earth_t1', bio: 'bio_t1', steel: 'steel_t1', mental: 'mental_t1',
};

/** Builder helper — fills in attack progression and defaults from type. */
function mk(
  id: string, dexNo: number, surname: string, type: MechaType,
  rarity: Rarity, role: string, stats: BaseStats, maxHp: number,
  flavor: string,
  opts: { acquisition?: string; price?: number; learnedAt?: LevelLearnedAttack[]; defaults?: string[]; quote?: string } = {},
): ModelData {
  return {
    id, dexNo, surname, type, rarity, role,
    acquisition: opts.acquisition ?? 'Store',
    price: opts.price,
    baseStats: stats,
    maxHp,
    defaultAttacks: opts.defaults ?? ['basic_strike', DEFAULT_T1[type]],
    learnedAt: opts.learnedAt ?? PROGRESSION_BY_TYPE[type],
    flavor,
    quote: opts.quote,
  };
}

// ============================================================
// THE DEX
// ============================================================
//
// Names below are placeholders meant to be editable. Replace freely.
// dexNo determines display order. IDs are stable — never change them
// after release (save data references them).

export const MODELS: Record<string, ModelData> = {
  // ============ STARTERS (3) ============
  hearthling: mk('hearthling', 1, 'Hearthling', 'fire', 'starter', 'Brawler',
    { attack: 22, defense: 16, speed: 14, intelligence: 14 }, 105,
    'Your uncle built this one. Fire core, hand-forged frame.',
    { acquisition: "Uncle's workshop", defaults: ['basic_strike', 'ember_punch'], quote: "BUILT BY HAND. FIGHTS WITH HEART." }),
  tideling: mk('tideling', 2, 'Tideling', 'water', 'starter', 'Sustain',
    { attack: 18, defense: 18, speed: 14, intelligence: 16 }, 110,
    'Water-pressure core. Forgives mistakes.',
    { acquisition: "Uncle's workshop", defaults: ['basic_strike', 'water_jet'], quote: "I BEND. I DO NOT BREAK." }),
  sprouting: mk('sprouting', 3, 'Sprouting', 'bio', 'starter', 'Healer',
    { attack: 16, defense: 20, speed: 12, intelligence: 18 }, 115,
    'Half-grown bio-frame. Self-repairs slowly between fights.',
    { acquisition: "Uncle's workshop", defaults: ['basic_strike', 'spore_lash'], quote: "ROOTS GO DEEP. GROWTH TAKES TIME." }),

  // ============ FIRE (12) ============
  // 4 common
  cinderboar:    mk('cinderboar',    11, 'Cinderboar',    'fire', 'common', 'Brawler',  { attack: 20, defense: 16, speed: 12, intelligence: 10 }, 105, 'Smoking trample frame.', { price: 800, quote: "I COME THROUGH. NOT AROUND." }),
  emberpup:      mk('emberpup',      12, 'Emberpup',      'fire', 'common', 'Skirmisher', { attack: 18, defense: 12, speed: 16, intelligence: 10 }, 90, 'Loyal but volatile.', { price: 750 }),
  forge_walker:  mk('forge_walker',  13, 'ForgeWalker',   'fire', 'common', 'Tank',     { attack: 16, defense: 22, speed: 8,  intelligence: 12 }, 120, 'Slow, heavy, hot.', { price: 850 }),
  smokebat:      mk('smokebat',      14, 'Smokebat',      'fire', 'common', 'Skirmisher', { attack: 17, defense: 11, speed: 19, intelligence: 12 }, 85, 'Hard to see in a smokescreen.', { price: 800 }),
  // 3 uncommon
  magma_lizard:  mk('magma_lizard',  15, 'MagmaLizard',   'fire', 'uncommon', 'Brawler', { attack: 24, defense: 18, speed: 14, intelligence: 12 }, 115, 'Lava-cooled scales.', { price: 1800 }),
  furnace_hound: mk('furnace_hound', 16, 'FurnaceHound',  'fire', 'uncommon', 'Brawler', { attack: 26, defense: 14, speed: 18, intelligence: 11 }, 105, 'Hunter pack frame.', { price: 1900 }),
  pyre_serpent:  mk('pyre_serpent',  17, 'PyreSerpent',   'fire', 'uncommon', 'Sustain', { attack: 22, defense: 18, speed: 15, intelligence: 16 }, 115, 'Coils around its prey.', { price: 2000 }),
  // 2 rare
  flame_phoenix: mk('flame_phoenix', 18, 'FlamePhoenix',  'fire', 'rare', 'Skirmisher', { attack: 28, defense: 16, speed: 22, intelligence: 16 }, 110, 'Reborn from each fight.', { price: 4500 }),
  solar_panther: mk('solar_panther', 19, 'SolarPanther',  'fire', 'rare', 'Brawler',    { attack: 30, defense: 18, speed: 20, intelligence: 14 }, 120, 'Fires bright. Cools slow.', { price: 4800 }),
  // 2 epic
  helios_guard:  mk('helios_guard',  20, 'HeliosGuard',   'fire', 'epic', 'Tank',       { attack: 28, defense: 28, speed: 14, intelligence: 18 }, 145, 'A sunbearer chassis.', { price: 11000 }),
  inferno_knight:mk('inferno_knight',21, 'InfernoKnight', 'fire', 'epic', 'Brawler',    { attack: 34, defense: 22, speed: 18, intelligence: 16 }, 135, 'Riot frame, banned in three regions.', { price: 11500 }),
  // 1 legendary
  ragnar_drake:  mk('ragnar_drake',  22, 'RagnarDrake',   'fire', 'legendary', 'Boss',  { attack: 40, defense: 26, speed: 20, intelligence: 20 }, 165, 'Said to be wild-born from the volcanoes south.', { price: 28000 }),

  // ============ WATER (12) ============
  // 4 common
  shore_drone:   mk('shore_drone',   23, 'ShoreDrone',    'water', 'common', 'Support',  { attack: 14, defense: 16, speed: 14, intelligence: 14 }, 95, 'Dock patroller. Salt has eaten the paint.', { price: 750 }),
  tidewall:      mk('tidewall',      24, 'Tidewall',      'water', 'common', 'Tank',     { attack: 14, defense: 24, speed: 10, intelligence: 14 }, 130, 'Heavy bulwark frame.', { price: 800 }),
  brinekit:      mk('brinekit',      25, 'Brinekit',      'water', 'common', 'Skirmisher',{ attack: 16, defense: 12, speed: 18, intelligence: 12 }, 90, 'Splashes a lot.', { price: 700 }),
  reefling:      mk('reefling',      26, 'Reefling',      'water', 'common', 'Sustain',  { attack: 15, defense: 18, speed: 12, intelligence: 16 }, 105, 'Coral-armored shell.', { price: 780 }),
  // 3 uncommon
  riptide_runner:mk('riptide_runner',27, 'RiptideRunner', 'water', 'uncommon', 'Skirmisher',{ attack: 20, defense: 14, speed: 22, intelligence: 14 }, 100, 'Fastest thing in the bay.', { price: 1900 }),
  hydra_jr:      mk('hydra_jr',      28, 'HydraJr',       'water', 'uncommon', 'Sustain',  { attack: 22, defense: 18, speed: 14, intelligence: 18 }, 120, 'Two heads, half opinions.', { price: 2000 }),
  whaleguard:    mk('whaleguard',    29, 'Whaleguard',    'water', 'uncommon', 'Tank',     { attack: 18, defense: 26, speed: 8,  intelligence: 16 }, 140, 'Built around a sonar core.', { price: 2100 }),
  // 2 rare
  storm_marlin:  mk('storm_marlin',  30, 'StormMarlin',   'water', 'rare', 'Brawler',    { attack: 28, defense: 18, speed: 22, intelligence: 16 }, 115, 'Lance-blade frame.', { price: 4600 }),
  abyss_walker:  mk('abyss_walker',  31, 'AbyssWalker',   'water', 'rare', 'Sustain',    { attack: 26, defense: 22, speed: 16, intelligence: 22 }, 125, 'Deep-pressure shell.', { price: 4900 }),
  // 2 epic
  kraken_minor:  mk('kraken_minor',  32, 'KrakenMinor',   'water', 'epic', 'Brawler',    { attack: 32, defense: 24, speed: 16, intelligence: 18 }, 145, 'Tentacle frame, prototype.', { price: 11500 }),
  leviathan_ii:  mk('leviathan_ii',  33, 'LeviathanII',   'water', 'epic', 'Tank',       { attack: 28, defense: 32, speed: 12, intelligence: 20 }, 165, 'A small leviathan. Truly.', { price: 12000 }),
  // 1 legendary
  poseidon_mk1:  mk('poseidon_mk1',  34, 'PoseidonMk1',   'water', 'legendary', 'Boss',  { attack: 38, defense: 30, speed: 18, intelligence: 24 }, 175, 'Crown of the deep circuit.', { price: 30000 }),

  // ============ LIGHTNING (12) ============
  voltrunner:    mk('voltrunner',    35, 'VoltRunner',    'lightning', 'common', 'Skirmisher', { attack: 20, defense: 10, speed: 24, intelligence: 14 }, 85, 'Light, fast, fragile.', { price: 800, quote: "I DON'T HIT HARD. I HIT FIRST. THEN I HIT AGAIN." }),
  brittle_charge:mk('brittle_charge',36, 'BrittleCharge', 'lightning', 'common', 'Abandoned',  { attack: 16, defense: 8, speed: 18, intelligence: 8 }, 65, 'Sparks when you get close.', { acquisition: 'Junkyard wild' }),
  sparkfly:      mk('sparkfly',      37, 'Sparkfly',      'lightning', 'common', 'Skirmisher', { attack: 18, defense: 9, speed: 22, intelligence: 12 }, 75, 'A glorified insect.', { price: 700 }),
  conduit_pup:   mk('conduit_pup',   38, 'ConduitPup',    'lightning', 'common', 'Support',    { attack: 16, defense: 12, speed: 20, intelligence: 14 }, 85, 'Routes charge from teammates.', { price: 780 }),
  storm_cur:     mk('storm_cur',     39, 'StormCur',      'lightning', 'uncommon','Skirmisher', { attack: 22, defense: 12, speed: 26, intelligence: 14 }, 95, 'A hunting dog with sparks.', { price: 1900 }),
  arc_marauder:  mk('arc_marauder',  40, 'ArcMarauder',   'lightning', 'uncommon','Brawler',    { attack: 26, defense: 14, speed: 22, intelligence: 13 }, 105, 'Underground racing build.', { price: 2000 }),
  thunder_owl:   mk('thunder_owl',   41, 'ThunderOwl',    'lightning', 'uncommon','Sustain',    { attack: 22, defense: 16, speed: 20, intelligence: 20 }, 110, 'Night hunter.', { price: 2100 }),
  voltlord:      mk('voltlord',      42, 'Voltlord',      'lightning', 'rare', 'Skirmisher',  { attack: 28, defense: 14, speed: 28, intelligence: 18 }, 110, 'Crown discharge frame.', { price: 4700 }),
  storm_lancer:  mk('storm_lancer',  43, 'StormLancer',   'lightning', 'rare', 'Brawler',     { attack: 32, defense: 18, speed: 22, intelligence: 16 }, 115, 'Lance frame, electrified.', { price: 4900 }),
  thunderbird:   mk('thunderbird',   44, 'Thunderbird',   'lightning', 'epic', 'Skirmisher',  { attack: 34, defense: 18, speed: 30, intelligence: 20 }, 130, 'Wing frame, very rare.', { price: 11500 }),
  arc_titan:     mk('arc_titan',     45, 'ArcTitan',      'lightning', 'epic', 'Brawler',     { attack: 36, defense: 22, speed: 22, intelligence: 18 }, 140, 'Walking lightning rod.', { price: 12000 }),
  zeus_prime:    mk('zeus_prime',    46, 'ZeusPrime',     'lightning', 'legendary', 'Boss',   { attack: 40, defense: 24, speed: 28, intelligence: 24 }, 160, 'Tournament-banned for 30 years.', { price: 30000 }),

  // ============ ICE (12) ============
  glassthorn:    mk('glassthorn',    47, 'Glassthorn',    'ice', 'common', 'Skirmisher', { attack: 17, defense: 12, speed: 17, intelligence: 12 }, 90, 'Northern make. Lighter than it looks.', { price: 750 }),
  frostpaw:      mk('frostpaw',      48, 'Frostpaw',      'ice', 'common', 'Sustain',    { attack: 16, defense: 16, speed: 14, intelligence: 14 }, 100, 'Cold-runner pup.', { price: 780 }),
  icicle_drone:  mk('icicle_drone',  49, 'IcicleDrone',   'ice', 'common', 'Support',    { attack: 18, defense: 12, speed: 16, intelligence: 14 }, 90, 'Dropper frame.', { price: 770 }),
  rimewolf:      mk('rimewolf',      50, 'Rimewolf',      'ice', 'common', 'Brawler',    { attack: 20, defense: 14, speed: 16, intelligence: 12 }, 100, 'Hunt-pack frame.', { price: 820 }),
  frost_titan_jr:mk('frost_titan_jr',51, 'FrostTitanJr',  'ice', 'uncommon','Tank',      { attack: 20, defense: 26, speed: 10, intelligence: 14 }, 135, 'Smaller than its father.', { price: 1900 }),
  bliz_serpent:  mk('bliz_serpent',  52, 'BlizSerpent',   'ice', 'uncommon','Sustain',   { attack: 22, defense: 18, speed: 16, intelligence: 18 }, 115, 'Snake of the white wastes.', { price: 2000 }),
  glacier_ram:   mk('glacier_ram',   53, 'GlacierRam',    'ice', 'uncommon','Brawler',   { attack: 26, defense: 20, speed: 14, intelligence: 12 }, 120, 'Mountain runner.', { price: 2050 }),
  ice_archer:    mk('ice_archer',    54, 'IceArcher',     'ice', 'rare', 'Skirmisher',  { attack: 28, defense: 16, speed: 22, intelligence: 18 }, 110, 'Long-range frame.', { price: 4600 }),
  frostbloom:    mk('frostbloom',    55, 'Frostbloom',    'ice', 'rare', 'Sustain',     { attack: 24, defense: 22, speed: 18, intelligence: 22 }, 125, 'Crystalline bio-frame.', { price: 4800 }),
  cryogon:       mk('cryogon',       56, 'Cryogon',       'ice', 'epic', 'Brawler',     { attack: 34, defense: 22, speed: 18, intelligence: 18 }, 135, 'Ten-thousand year build.', { price: 11500 }),
  frost_titan:   mk('frost_titan',   57, 'FrostTitan',    'ice', 'epic', 'Tank',        { attack: 28, defense: 34, speed: 12, intelligence: 20 }, 165, 'A walking glacier.', { price: 12000 }),
  fimbul_wolf:   mk('fimbul_wolf',   58, 'FimbulWolf',    'ice', 'legendary', 'Boss',   { attack: 40, defense: 28, speed: 22, intelligence: 22 }, 165, 'Wild king of the long winter.', { price: 30000 }),

  // ============ EARTH (12) ============
  scrap_grunt:   mk('scrap_grunt',   59, 'ScrapGrunt',    'earth', 'common', 'Filler',     { attack: 16, defense: 18, speed: 10, intelligence: 8 }, 105, 'Foundry leftovers. Dependable.', { price: 600 }),
  pebble_kin:    mk('pebble_kin',    60, 'PebbleKin',     'earth', 'common', 'Skirmisher', { attack: 18, defense: 16, speed: 14, intelligence: 10 }, 95, 'A talking pile of small rocks.', { price: 750 }),
  digbug:        mk('digbug',        61, 'Digbug',        'earth', 'common', 'Sustain',    { attack: 14, defense: 18, speed: 12, intelligence: 12 }, 105, 'Burrows. Reappears.', { price: 720 }),
  stone_jack:    mk('stone_jack',    62, 'StoneJack',     'earth', 'common', 'Brawler',    { attack: 22, defense: 18, speed: 10, intelligence: 8 }, 115, 'A hammer with legs.', { price: 800 }),
  rockwarden:    mk('rockwarden',    63, 'Rockwarden',    'earth', 'uncommon','Tank',      { attack: 19, defense: 26, speed: 8,  intelligence: 11 }, 135, 'Stone-cored bulwark.', { price: 1900 }),
  granite_boar:  mk('granite_boar',  64, 'GraniteBoar',   'earth', 'uncommon','Brawler',   { attack: 24, defense: 22, speed: 12, intelligence: 10 }, 125, 'Charges in a straight line.', { price: 2000 }),
  loam_lurker:   mk('loam_lurker',   65, 'LoamLurker',    'earth', 'uncommon','Sustain',   { attack: 20, defense: 20, speed: 14, intelligence: 16 }, 125, 'Lives in the soil. Comes up.', { price: 1950 }),
  obsidian_ape:  mk('obsidian_ape',  66, 'ObsidianApe',   'earth', 'rare', 'Brawler',     { attack: 30, defense: 20, speed: 16, intelligence: 14 }, 130, 'Volcanic glass armor.', { price: 4700 }),
  geode_serpent: mk('geode_serpent', 67, 'GeodeSerpent',  'earth', 'rare', 'Sustain',     { attack: 26, defense: 22, speed: 18, intelligence: 20 }, 130, 'Crystal-coated spine.', { price: 4800 }),
  mountain_lord: mk('mountain_lord', 68, 'MountainLord',  'earth', 'epic', 'Tank',        { attack: 30, defense: 34, speed: 10, intelligence: 18 }, 175, 'Sleeps standing.', { price: 11800 }),
  golem_alpha:   mk('golem_alpha',   69, 'GolemAlpha',    'earth', 'epic', 'Brawler',     { attack: 34, defense: 26, speed: 14, intelligence: 16 }, 150, 'Pre-Sundering build.', { price: 12000 }),
  atlas_xii:     mk('atlas_xii',     70, 'AtlasXII',      'earth', 'legendary', 'Boss',   { attack: 38, defense: 32, speed: 14, intelligence: 24 }, 180, 'Carries small hills.', { price: 30000 }),

  // ============ BIO (12) ============
  pollen_one:    mk('pollen_one',    71, 'Pollen-One',    'bio', 'common', 'Sustain',    { attack: 13, defense: 15, speed: 12, intelligence: 16 }, 100, 'Half built, half grown.', { price: 800 }),
  feral_grub:    mk('feral_grub',    72, 'FeralGrub',     'bio', 'common', 'Abandoned',  { attack: 14, defense: 10, speed: 14, intelligence: 8 }, 70, 'Grew up alone.', { acquisition: 'Junkyard wild' }),
  mosspup:       mk('mosspup',       73, 'Mosspup',       'bio', 'common', 'Healer',     { attack: 14, defense: 16, speed: 12, intelligence: 16 }, 105, 'Furry. Patient.', { price: 780 }),
  thorncrawler:  mk('thorncrawler',  74, 'Thorncrawler',  'bio', 'common', 'Skirmisher', { attack: 18, defense: 12, speed: 16, intelligence: 12 }, 90, 'Vine-legged scout.', { price: 750 }),
  sap_serpent:   mk('sap_serpent',   75, 'SapSerpent',    'bio', 'uncommon','Sustain',   { attack: 20, defense: 16, speed: 14, intelligence: 20 }, 115, 'Stinging sap.', { price: 1900 }),
  rootbeast:     mk('rootbeast',     76, 'Rootbeast',     'bio', 'uncommon','Tank',      { attack: 18, defense: 24, speed: 10, intelligence: 18 }, 135, 'Anchored when it stops.', { price: 2000 }),
  spore_witch:   mk('spore_witch',   77, 'SporeWitch',    'bio', 'uncommon','Sustain',   { attack: 22, defense: 16, speed: 16, intelligence: 22 }, 115, 'Releases poisonous clouds.', { price: 2050 }),
  bramble_lion:  mk('bramble_lion',  78, 'BrambleLion',   'bio', 'rare', 'Brawler',     { attack: 28, defense: 18, speed: 20, intelligence: 18 }, 120, 'Thorny mane.', { price: 4600 }),
  fungal_kraken: mk('fungal_kraken', 79, 'FungalKraken',  'bio', 'rare', 'Sustain',     { attack: 26, defense: 22, speed: 14, intelligence: 26 }, 130, 'Lives off the dead.', { price: 4900 }),
  worldtree_jr: mk('worldtree_jr',   80, 'WorldtreeJr',   'bio', 'epic', 'Healer',      { attack: 24, defense: 30, speed: 12, intelligence: 28 }, 160, 'Sapling of the world tree.', { price: 11500 }),
  grovemother:   mk('grovemother',   81, 'Grovemother',   'bio', 'epic', 'Sustain',     { attack: 30, defense: 24, speed: 16, intelligence: 26 }, 150, 'The queen of the green.', { price: 12000 }),
  yggdra:        mk('yggdra',        82, 'Yggdra',        'bio', 'legendary', 'Boss',   { attack: 36, defense: 28, speed: 16, intelligence: 32 }, 175, 'Walks slow. Speaks in growths.', { price: 30000 }),

  // ============ STEEL (12) ============
  iron_jack:     mk('iron_jack',     83, 'IronJack',      'steel', 'common', 'Brawler',  { attack: 18, defense: 14, speed: 13, intelligence: 10 }, 100, 'Pit classic.', { price: 700 }),
  rust_husk:     mk('rust_husk',     84, 'RustHusk',      'steel', 'common', 'Abandoned',{ attack: 12, defense: 14, speed: 8,  intelligence: 6 }, 75, 'Was something, once.', { acquisition: 'Junkyard wild' }),
  rivet_kin:     mk('rivet_kin',     85, 'RivetKin',      'steel', 'common', 'Support',  { attack: 16, defense: 16, speed: 12, intelligence: 12 }, 100, 'Repair-frame.', { price: 750 }),
  scrap_knight:  mk('scrap_knight',  86, 'ScrapKnight',   'steel', 'common', 'Tank',     { attack: 16, defense: 22, speed: 9,  intelligence: 10 }, 120, 'Welded together by hand.', { price: 820 }),
  steel_boar:    mk('steel_boar',    87, 'SteelBoar',     'steel', 'uncommon','Brawler', { attack: 24, defense: 20, speed: 12, intelligence: 10 }, 120, 'Crashes through doors.', { price: 1900 }),
  cannon_squire: mk('cannon_squire', 88, 'CannonSquire',  'steel', 'uncommon','Brawler', { attack: 26, defense: 16, speed: 14, intelligence: 12 }, 115, 'Has a recoil problem.', { price: 1950 }),
  bunker_drake:  mk('bunker_drake',  89, 'BunkerDrake',   'steel', 'uncommon','Tank',    { attack: 20, defense: 28, speed: 8,  intelligence: 14 }, 145, 'Walks like a bunker.', { price: 2050 }),
  warforge:      mk('warforge',      90, 'Warforge',      'steel', 'rare', 'Brawler',   { attack: 32, defense: 22, speed: 14, intelligence: 14 }, 130, 'Built for assault circuits.', { price: 4700 }),
  iron_centaur:  mk('iron_centaur',  91, 'IronCentaur',   'steel', 'rare', 'Skirmisher',{ attack: 30, defense: 20, speed: 22, intelligence: 16 }, 120, 'Four-legged combat frame.', { price: 4900 }),
  bastion_xi:    mk('bastion_xi',    92, 'BastionXI',     'steel', 'epic', 'Tank',      { attack: 28, defense: 34, speed: 10, intelligence: 20 }, 175, 'Walking fortress.', { price: 11500 }),
  ironwolf:      mk('ironwolf',      93, 'Ironwolf',      'steel', 'epic', 'Brawler',   { attack: 36, defense: 24, speed: 18, intelligence: 16 }, 145, 'Industrial hunter.', { price: 12000 }),
  juggernaut_a:  mk('juggernaut_a',  94, 'JuggernautA',   'steel', 'legendary', 'Boss', { attack: 40, defense: 30, speed: 16, intelligence: 22 }, 180, 'The factory-floor champion.', { price: 30000 }),

  // ============ MENTAL (12) ============
  mindless:      mk('mindless',      95, 'Mindless',      'mental', 'common', 'Skirmisher', { attack: 16, defense: 12, speed: 16, intelligence: 18 }, 90, 'Hollow eyes. Quiet.', { price: 800 }),
  echoling:      mk('echoling',      96, 'Echoling',      'mental', 'common', 'Support',    { attack: 14, defense: 14, speed: 14, intelligence: 22 }, 95, 'Repeats what it heard.', { price: 820 }),
  blank_jr:      mk('blank_jr',      97, 'BlankJr',       'mental', 'common', 'Sustain',    { attack: 14, defense: 16, speed: 13, intelligence: 20 }, 100, 'Asks questions.', { price: 790 }),
  daydream:      mk('daydream',      98, 'Daydream',      'mental', 'common', 'Skirmisher', { attack: 18, defense: 10, speed: 18, intelligence: 22 }, 85, 'Hard to focus on.', { price: 800 }),
  mindlance:     mk('mindlance',     99, 'Mindlance',     'mental', 'uncommon','Skirmisher', { attack: 22, defense: 14, speed: 20, intelligence: 24 }, 95, 'Sharp thinker.', { price: 1900 }),
  thinker:       mk('thinker',      100, 'Thinker',       'mental', 'uncommon','Sustain',    { attack: 20, defense: 18, speed: 14, intelligence: 28 }, 115, 'Slow to act. Hard to surprise.', { price: 2000 }),
  oracle_jr:     mk('oracle_jr',    101, 'OracleJr',      'mental', 'uncommon','Support',    { attack: 18, defense: 16, speed: 18, intelligence: 30 }, 110, 'Tells you what you already knew.', { price: 2050 }),
  archivist:     mk('archivist',    102, 'Archivist',     'mental', 'rare', 'Sustain',     { attack: 24, defense: 22, speed: 16, intelligence: 32 }, 125, 'Remembers everything.', { price: 4700 }),
  dreamhound:    mk('dreamhound',   103, 'Dreamhound',    'mental', 'rare', 'Skirmisher',  { attack: 28, defense: 16, speed: 26, intelligence: 26 }, 110, 'Hunts in your sleep.', { price: 4800 }),
  oracle_alpha:  mk('oracle_alpha', 104, 'OracleAlpha',   'mental', 'epic', 'Sustain',     { attack: 28, defense: 26, speed: 18, intelligence: 36 }, 140, 'Saw this fight before.', { price: 11500 }),
  void_walker:   mk('void_walker',  105, 'VoidWalker',    'mental', 'epic', 'Skirmisher',  { attack: 32, defense: 20, speed: 28, intelligence: 32 }, 130, 'Steps between thoughts.', { price: 12000 }),
  prime_mind:    mk('prime_mind',   106, 'PrimeMind',     'mental', 'legendary', 'Boss',   { attack: 36, defense: 28, speed: 22, intelligence: 40 }, 165, 'A mecha that may be aware.', { price: 30000 }),

  // ============ GOD TYPES (3) ============
  // Effective against all types. Story-locked. Cannot be bought.
  alpha_omega: mk('alpha_omega', 107, 'AlphaOmega', 'mental', 'god', 'Mythic',
    { attack: 50, defense: 40, speed: 30, intelligence: 50 }, 220,
    'A god-type. Said to predate the Sundering.',
    { acquisition: 'Story-locked', learnedAt: PROGRESSION_BY_TYPE.mental }),
  ironmind: mk('ironmind', 108, 'Ironmind', 'steel', 'god', 'Mythic',
    { attack: 48, defense: 50, speed: 24, intelligence: 36 }, 240,
    'A god-type. The first frame that learned to refuse orders.',
    { acquisition: 'Story-locked', learnedAt: PROGRESSION_BY_TYPE.steel }),
  worldfire: mk('worldfire', 109, 'Worldfire', 'fire', 'god', 'Mythic',
    { attack: 54, defense: 36, speed: 32, intelligence: 32 }, 200,
    'A god-type. A burning frame nobody built.',
    { acquisition: 'Story-locked', learnedAt: PROGRESSION_BY_TYPE.fire }),
};

export const MODEL_LIST = Object.values(MODELS);
