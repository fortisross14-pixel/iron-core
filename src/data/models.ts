import type { MechaType } from './types';

export type Rarity = 'starter' | 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';

export interface BaseStats {
  attack: number;
  defense: number;
  speed: number;
  intelligence: number;
}

export interface ModelData {
  id: string;
  dexNo: number;
  surname: string;                   // appended after the bot's first name ("Vigir VoltRunner")
  type: MechaType;
  rarity: Rarity;
  role: string;
  acquisition: string;
  price?: number;
  baseStats: BaseStats;
  maxHp: number;
  defaultAttacks: string[];          // attack IDs the bot starts with
  flavor: string;
}

export const RARITY_INFO: Record<Rarity, { name: string; color: string }> = {
  starter:   { name: 'Starter',   color: '#7df0ff' },
  common:    { name: 'Common',    color: '#888' },
  uncommon:  { name: 'Uncommon',  color: '#7fb069' },
  rare:      { name: 'Rare',      color: '#5fa8ff' },
  epic:      { name: 'Epic',      color: '#c896ff' },
  legendary: { name: 'Legendary', color: '#ffd700' },
};

export const TOTAL_DEX = 100;

export const MODELS: Record<string, ModelData> = {
  // ============ STARTERS ============
  // Uncle's gift — given to the player at the start of the story.
  // Three options. All have the 'starter' rarity. Player picks one.
  hearthling: {
    id: 'hearthling', dexNo: 1, surname: 'Hearthling', type: 'fire',
    rarity: 'starter', role: 'Brawler', acquisition: "Uncle's workshop",
    baseStats: { attack: 22, defense: 16, speed: 14, intelligence: 14 },
    maxHp: 105,
    defaultAttacks: ['basic_strike', 'ember_punch'],
    flavor: 'Your uncle built this one for you. Fire core, hand-forged frame.',
  },
  tideling: {
    id: 'tideling', dexNo: 2, surname: 'Tideling', type: 'water',
    rarity: 'starter', role: 'Sustain', acquisition: "Uncle's workshop",
    baseStats: { attack: 18, defense: 18, speed: 14, intelligence: 16 },
    maxHp: 110,
    defaultAttacks: ['basic_strike', 'water_jet'],
    flavor: 'Water-pressure core. Balanced. Your uncle says it forgives mistakes.',
  },
  sprouting: {
    id: 'sprouting', dexNo: 3, surname: 'Sprouting', type: 'bio',
    rarity: 'starter', role: 'Healer', acquisition: "Uncle's workshop",
    baseStats: { attack: 16, defense: 20, speed: 12, intelligence: 18 },
    maxHp: 115,
    defaultAttacks: ['basic_strike', 'spore_lash'],
    flavor: 'Half-grown bio-frame. Lifesteals on hit. Self-repairs slowly between fights.',
  },

  // ============ COMMONS (sold in stores) ============
  scrap_grunt: {
    id: 'scrap_grunt', dexNo: 4, surname: 'ScrapGrunt', type: 'earth',
    rarity: 'common', role: 'Filler', acquisition: 'Store', price: 600,
    baseStats: { attack: 16, defense: 18, speed: 10, intelligence: 8 },
    maxHp: 105,
    defaultAttacks: ['basic_strike', 'stone_fist'],
    flavor: 'Foundry leftovers. Cheap. Dependable.',
  },
  iron_jack: {
    id: 'iron_jack', dexNo: 5, surname: 'IronJack', type: 'steel',
    rarity: 'common', role: 'Brawler', acquisition: 'Store', price: 700,
    baseStats: { attack: 18, defense: 14, speed: 13, intelligence: 10 },
    maxHp: 100,
    defaultAttacks: ['basic_strike', 'rivet_punch'],
    flavor: 'Pit classic. Every Operator owns one eventually.',
  },
  shore_drone: {
    id: 'shore_drone', dexNo: 6, surname: 'ShoreDrone', type: 'water',
    rarity: 'common', role: 'Support', acquisition: 'Store', price: 700,
    baseStats: { attack: 14, defense: 16, speed: 14, intelligence: 14 },
    maxHp: 95,
    defaultAttacks: ['basic_strike', 'water_jet'],
    flavor: 'Dock patroller. Salt has eaten half the paint.',
  },
  glassthorn: {
    id: 'glassthorn', dexNo: 7, surname: 'Glassthorn', type: 'ice',
    rarity: 'common', role: 'Skirmisher', acquisition: 'Store', price: 700,
    baseStats: { attack: 17, defense: 12, speed: 17, intelligence: 12 },
    maxHp: 90,
    defaultAttacks: ['basic_strike', 'frost_jab'],
    flavor: 'Northern make. Lighter than it looks.',
  },
  pollen_one: {
    id: 'pollen_one', dexNo: 8, surname: 'Pollen-One', type: 'bio',
    rarity: 'common', role: 'Sustain', acquisition: 'Store', price: 800,
    baseStats: { attack: 13, defense: 15, speed: 12, intelligence: 16 },
    maxHp: 100,
    defaultAttacks: ['basic_strike', 'spore_lash'],
    flavor: 'Half built, half grown.',
  },
  voltrunner: {
    id: 'voltrunner', dexNo: 9, surname: 'VoltRunner', type: 'lightning',
    rarity: 'common', role: 'Skirmisher', acquisition: 'Store', price: 750,
    baseStats: { attack: 20, defense: 10, speed: 24, intelligence: 14 },
    maxHp: 85,
    defaultAttacks: ['basic_strike', 'spark'],
    flavor: 'Light, fast, fragile.',
  },
  tidewall: {
    id: 'tidewall', dexNo: 10, surname: 'Tidewall', type: 'water',
    rarity: 'common', role: 'Tank', acquisition: 'Store', price: 800,
    baseStats: { attack: 14, defense: 24, speed: 10, intelligence: 14 },
    maxHp: 130,
    defaultAttacks: ['basic_strike', 'water_jet'],
    flavor: 'Heavy bulwark frame. Slow but immovable.',
  },

  // ============ UNCOMMONS ============
  cinderboar: {
    id: 'cinderboar', dexNo: 11, surname: 'Cinderboar', type: 'fire',
    rarity: 'uncommon', role: 'Brawler', acquisition: 'Store', price: 1800,
    baseStats: { attack: 22, defense: 18, speed: 11, intelligence: 10 },
    maxHp: 115,
    defaultAttacks: ['ember_punch', 'cinder_burst'],
    flavor: 'Smoking trample frame.',
  },
  rockwarden: {
    id: 'rockwarden', dexNo: 12, surname: 'Rockwarden', type: 'earth',
    rarity: 'uncommon', role: 'Tank', acquisition: 'Store', price: 1900,
    baseStats: { attack: 19, defense: 26, speed: 8, intelligence: 11 },
    maxHp: 135,
    defaultAttacks: ['stone_fist', 'quake_slam'],
    flavor: 'Stone-cored bulwark. Built for one job.',
  },

  // ============ JUNKYARD WILDS (encounter only — abandoned mechas) ============
  // These appear as random enemies in the junkyard grinder. Not collectible.
  rust_husk: {
    id: 'rust_husk', dexNo: 13, surname: 'RustHusk', type: 'steel',
    rarity: 'common', role: 'Abandoned', acquisition: 'Junkyard wild',
    baseStats: { attack: 12, defense: 14, speed: 8, intelligence: 6 },
    maxHp: 75,
    defaultAttacks: ['basic_strike'],
    flavor: 'Was something, once. Now barely moves.',
  },
  feral_grub: {
    id: 'feral_grub', dexNo: 14, surname: 'FeralGrub', type: 'bio',
    rarity: 'common', role: 'Abandoned', acquisition: 'Junkyard wild',
    baseStats: { attack: 14, defense: 10, speed: 14, intelligence: 8 },
    maxHp: 70,
    defaultAttacks: ['basic_strike', 'spore_lash'],
    flavor: 'A pollen-frame that nobody came back for. It grew.',
  },
  brittle_charge: {
    id: 'brittle_charge', dexNo: 15, surname: 'BrittleCharge', type: 'lightning',
    rarity: 'common', role: 'Abandoned', acquisition: 'Junkyard wild',
    baseStats: { attack: 16, defense: 8, speed: 18, intelligence: 8 },
    maxHp: 65,
    defaultAttacks: ['spark'],
    flavor: 'Sparks when you get close. Probably unsafe.',
  },
};

export const MODEL_LIST = Object.values(MODELS);
