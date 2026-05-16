import type { MechaType } from './types';

export type AttackElement = MechaType | 'physical';

export interface StatusInflict {
  type: 'burn' | 'poison' | 'slow' | 'stun' | 'confuse' | 'armor_break' | 'corrode';
  chance: number;
  duration: number;
  value: number;
}

export interface Attack {
  id: string;
  name: string;
  type: AttackElement;
  power: number;
  accuracy: number;
  desc: string;
  speedBonus?: number;
  lifesteal?: number;
  ignoresDefense?: number;
  statusInflict?: StatusInflict;
  isSignature?: boolean;
}

export const ATTACKS: Record<string, Attack> = {
  // ---- universal physical ----
  basic_strike: { id: 'basic_strike', name: 'Basic Strike', type: 'physical', power: 24, accuracy: 95, desc: 'Reliable melee.' },
  quick_jab:    { id: 'quick_jab',    name: 'Quick Jab',    type: 'physical', power: 16, accuracy: 100, speedBonus: 4, desc: 'Fast strike.' },

  // ---- fire ----
  ember_punch:  { id: 'ember_punch',  name: 'Ember Punch',  type: 'fire', power: 26, accuracy: 95, desc: 'Heated strike.' },
  cinder_burst: { id: 'cinder_burst', name: 'Cinder Burst', type: 'fire', power: 30, accuracy: 90, desc: 'Burns over 3 turns.',
    statusInflict: { type: 'burn', chance: 0.7, duration: 3, value: 8 } },

  // ---- water ----
  water_jet:    { id: 'water_jet',    name: 'Water Jet',    type: 'water', power: 24, accuracy: 100, desc: 'Pressurized stream.' },
  tide_cannon:  { id: 'tide_cannon',  name: 'Tide Cannon',  type: 'water', power: 30, accuracy: 90, desc: 'Concussive blast.' },

  // ---- lightning ----
  spark:        { id: 'spark',        name: 'Spark',        type: 'lightning', power: 22, accuracy: 100, speedBonus: 3, desc: 'Quick arc.' },
  thunderfork:  { id: 'thunderfork',  name: 'Thunderfork',  type: 'lightning', power: 28, accuracy: 95, speedBonus: 6, desc: 'Storm rod.' },

  // ---- ice ----
  frost_jab:    { id: 'frost_jab',    name: 'Frost Jab',    type: 'ice', power: 24, accuracy: 95, desc: 'Cold strike.' },
  frostbite:    { id: 'frostbite',    name: 'Frostbite',    type: 'ice', power: 26, accuracy: 100, desc: 'Always slows.',
    statusInflict: { type: 'slow', chance: 1.0, duration: 3, value: 6 } },

  // ---- earth ----
  stone_fist:   { id: 'stone_fist',   name: 'Stone Fist',   type: 'earth', power: 28, accuracy: 90, desc: 'Rocky knuckle.' },
  quake_slam:   { id: 'quake_slam',   name: 'Quake Slam',   type: 'earth', power: 34, accuracy: 80, desc: 'Ground-shaker.' },

  // ---- bio ----
  spore_lash:   { id: 'spore_lash',   name: 'Spore Lash',   type: 'bio', power: 22, accuracy: 100, lifesteal: 0.4, desc: 'Heals 40% of damage dealt.' },
  rot_touch:    { id: 'rot_touch',    name: 'Rot Touch',    type: 'bio', power: 20, accuracy: 95, desc: 'Poisons.',
    statusInflict: { type: 'poison', chance: 1.0, duration: 5, value: 6 } },

  // ---- steel ----
  rivet_punch:  { id: 'rivet_punch',  name: 'Rivet Punch',  type: 'steel', power: 26, accuracy: 95, desc: 'Hardened fist.' },
  piston_slam:  { id: 'piston_slam',  name: 'Piston Slam',  type: 'steel', power: 32, accuracy: 85, desc: 'Industrial driver.' },

  // ---- mental ----
  neurospike:   { id: 'neurospike',   name: 'Neurospike',   type: 'mental', power: 26, accuracy: 90, desc: '30% chance to confuse.',
    statusInflict: { type: 'confuse', chance: 0.3, duration: 2, value: 0 } },
  mind_lance:   { id: 'mind_lance',   name: 'Mind Lance',   type: 'mental', power: 28, accuracy: 95, ignoresDefense: 0.7, desc: 'Ignores 70% defense.' },

  // ---- signatures (weapon-locked) ----
  sig_magma_lance:   { id: 'sig_magma_lance',   name: 'Magma Lance',   type: 'fire',      power: 60, accuracy: 85, isSignature: true, desc: 'Devastating thermite jet.' },
  sig_tsunami:       { id: 'sig_tsunami',       name: 'Tsunami',       type: 'water',     power: 55, accuracy: 90, isSignature: true, desc: 'Crushing wave.' },
  sig_chain_storm:   { id: 'sig_chain_storm',   name: 'Chain Storm',   type: 'lightning', power: 50, accuracy: 90, isSignature: true, speedBonus: 8, desc: 'Crackling burst.' },
  sig_avalanche:     { id: 'sig_avalanche',     name: 'Avalanche',     type: 'ice',       power: 58, accuracy: 85, isSignature: true,
    statusInflict: { type: 'slow', chance: 1.0, duration: 3, value: 7 }, desc: 'Buries the field.' },
  sig_meteor:        { id: 'sig_meteor',        name: 'Meteor Strike', type: 'earth',     power: 65, accuracy: 80, isSignature: true, desc: 'Falling rock.' },
  sig_overgrowth:    { id: 'sig_overgrowth',    name: 'Overgrowth',    type: 'bio',       power: 45, accuracy: 95, isSignature: true, lifesteal: 0.6, desc: 'Heavy lifesteal.' },
  sig_industrial:    { id: 'sig_industrial',    name: 'Sledge Press',  type: 'steel',     power: 58, accuracy: 90, isSignature: true, desc: 'Hydraulic finisher.' },
  sig_mind_shatter:  { id: 'sig_mind_shatter',  name: 'Mind Shatter',  type: 'mental',    power: 55, accuracy: 90, isSignature: true, ignoresDefense: 0.9, desc: 'Bypasses armor.' },
  sig_haymaker:      { id: 'sig_haymaker',      name: 'Haymaker',      type: 'physical',  power: 58, accuracy: 80, isSignature: true, desc: 'A finisher punch.' },
};
