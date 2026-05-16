/**
 * ATTACKS — central registry.
 *
 * Each model learns 5 attacks total over the course of leveling:
 *   default (level 1) — defined in ModelData.defaultAttacks
 *   Then learnedAt entries at levels 2, 5, 10, 20, 30.
 *
 * Naming convention for type attacks:
 *   {type}_t1 ... {type}_t5  → escalating power for each type
 *
 * Status/utility moves named separately by effect.
 *
 * Signatures are weapon-locked and unlock at battle round 3.
 */

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
  // ============== universal physical ==============
  basic_strike: { id: 'basic_strike', name: 'Basic Strike', type: 'physical', power: 24, accuracy: 95, desc: 'Reliable melee.' },
  quick_jab:    { id: 'quick_jab',    name: 'Quick Jab',    type: 'physical', power: 16, accuracy: 100, speedBonus: 4, desc: 'Fast strike.' },
  heavy_blow:   { id: 'heavy_blow',   name: 'Heavy Blow',   type: 'physical', power: 40, accuracy: 80, desc: 'Slow but powerful.' },
  brace:        { id: 'brace',        name: 'Brace',        type: 'physical', power: 0, accuracy: 100, desc: '+30% DEF this round.' },

  // ============== fire ==============
  fire_t1:  { id: 'fire_t1', name: 'Ember',        type: 'fire', power: 18, accuracy: 100, desc: 'A small flame.' },
  ember_punch: { id: 'ember_punch', name: 'Ember Punch', type: 'fire', power: 26, accuracy: 95, desc: 'Heated strike.' },
  cinder_burst: { id: 'cinder_burst', name: 'Cinder Burst', type: 'fire', power: 30, accuracy: 90, desc: 'Burns over 3 turns.',
    statusInflict: { type: 'burn', chance: 0.7, duration: 3, value: 8 } },
  fire_t4:  { id: 'fire_t4', name: 'Magma Coil',   type: 'fire', power: 42, accuracy: 85, desc: 'Wraps the enemy in heat.',
    statusInflict: { type: 'burn', chance: 0.5, duration: 3, value: 10 } },
  fire_t5:  { id: 'fire_t5', name: 'Solar Lance',  type: 'fire', power: 60, accuracy: 80, desc: 'Concentrated thermal beam.' },

  // ============== water ==============
  water_t1: { id: 'water_t1', name: 'Splash',      type: 'water', power: 16, accuracy: 100, desc: 'A weak spray.' },
  water_jet: { id: 'water_jet', name: 'Water Jet', type: 'water', power: 24, accuracy: 100, desc: 'Pressurized stream.' },
  tide_cannon: { id: 'tide_cannon', name: 'Tide Cannon', type: 'water', power: 30, accuracy: 90, desc: 'Concussive blast.' },
  water_t4: { id: 'water_t4', name: 'Pressure Wave', type: 'water', power: 42, accuracy: 85, desc: 'Crushing volume of water.',
    statusInflict: { type: 'slow', chance: 0.6, duration: 2, value: 5 } },
  water_t5: { id: 'water_t5', name: 'Maelstrom',    type: 'water', power: 58, accuracy: 80, desc: 'A turning sea.' },

  // ============== lightning ==============
  lightning_t1: { id: 'lightning_t1', name: 'Static',     type: 'lightning', power: 16, accuracy: 100, speedBonus: 2, desc: 'A small charge.' },
  spark:    { id: 'spark', name: 'Spark', type: 'lightning', power: 22, accuracy: 100, speedBonus: 3, desc: 'Quick arc.' },
  thunderfork: { id: 'thunderfork', name: 'Thunderfork', type: 'lightning', power: 28, accuracy: 95, speedBonus: 6, desc: 'Storm rod.' },
  lightning_t4: { id: 'lightning_t4', name: 'Volt Lance', type: 'lightning', power: 40, accuracy: 90, speedBonus: 5, desc: 'Concentrated bolt.',
    statusInflict: { type: 'stun', chance: 0.3, duration: 1, value: 0 } },
  lightning_t5: { id: 'lightning_t5', name: 'Thundercrash', type: 'lightning', power: 56, accuracy: 85, speedBonus: 8, desc: 'Storm-rending strike.' },

  // ============== ice ==============
  ice_t1:   { id: 'ice_t1', name: 'Chill',         type: 'ice', power: 16, accuracy: 100, desc: 'A cold draft.' },
  frost_jab: { id: 'frost_jab', name: 'Frost Jab', type: 'ice', power: 24, accuracy: 95, desc: 'Cold strike.' },
  frostbite: { id: 'frostbite', name: 'Frostbite', type: 'ice', power: 26, accuracy: 100, desc: 'Always slows.',
    statusInflict: { type: 'slow', chance: 1.0, duration: 3, value: 6 } },
  ice_t4:   { id: 'ice_t4', name: 'Ice Spear',     type: 'ice', power: 40, accuracy: 90, desc: 'Sharp frozen lance.',
    statusInflict: { type: 'slow', chance: 0.7, duration: 3, value: 6 } },
  ice_t5:   { id: 'ice_t5', name: 'Glacier Drop',  type: 'ice', power: 56, accuracy: 80, desc: 'Falling mass of ice.',
    statusInflict: { type: 'stun', chance: 0.4, duration: 1, value: 0 } },

  // ============== earth ==============
  earth_t1: { id: 'earth_t1', name: 'Pebble',      type: 'earth', power: 18, accuracy: 100, desc: 'Small thrown rock.' },
  stone_fist: { id: 'stone_fist', name: 'Stone Fist', type: 'earth', power: 28, accuracy: 90, desc: 'Rocky knuckle.' },
  quake_slam: { id: 'quake_slam', name: 'Quake Slam', type: 'earth', power: 34, accuracy: 80, desc: 'Ground-shaker.' },
  earth_t4: { id: 'earth_t4', name: 'Rockfall',    type: 'earth', power: 44, accuracy: 80, desc: 'Crushing debris.',
    statusInflict: { type: 'armor_break', chance: 0.5, duration: 3, value: 0.3 } },
  earth_t5: { id: 'earth_t5', name: 'Tectonic Shift', type: 'earth', power: 62, accuracy: 75, desc: 'Reshapes the ground.' },

  // ============== bio ==============
  bio_t1:   { id: 'bio_t1', name: 'Vine',          type: 'bio', power: 16, accuracy: 100, lifesteal: 0.3, desc: 'A small grasping vine.' },
  spore_lash: { id: 'spore_lash', name: 'Spore Lash', type: 'bio', power: 22, accuracy: 100, lifesteal: 0.4, desc: 'Heals 40% of damage dealt.' },
  rot_touch: { id: 'rot_touch', name: 'Rot Touch', type: 'bio', power: 20, accuracy: 95, desc: 'Poisons.',
    statusInflict: { type: 'poison', chance: 1.0, duration: 5, value: 6 } },
  bio_t4:   { id: 'bio_t4', name: 'Bloodgrasp',    type: 'bio', power: 38, accuracy: 90, lifesteal: 0.5, desc: 'Stronger life drain.' },
  bio_t5:   { id: 'bio_t5', name: 'Wildgrowth',    type: 'bio', power: 50, accuracy: 90, lifesteal: 0.6, desc: 'A surging mass.' },

  // ============== steel ==============
  steel_t1: { id: 'steel_t1', name: 'Tap',         type: 'steel', power: 18, accuracy: 100, desc: 'A measured strike.' },
  rivet_punch: { id: 'rivet_punch', name: 'Rivet Punch', type: 'steel', power: 26, accuracy: 95, desc: 'Hardened fist.' },
  piston_slam: { id: 'piston_slam', name: 'Piston Slam', type: 'steel', power: 32, accuracy: 85, desc: 'Industrial driver.' },
  steel_t4: { id: 'steel_t4', name: 'Hammer Press', type: 'steel', power: 44, accuracy: 85, desc: 'Crushing weight.',
    statusInflict: { type: 'corrode', chance: 0.4, duration: 3, value: 0.2 } },
  steel_t5: { id: 'steel_t5', name: 'Industrial Smash', type: 'steel', power: 60, accuracy: 80, desc: 'A factory-floor finisher.' },

  // ============== mental ==============
  mental_t1: { id: 'mental_t1', name: 'Hush',      type: 'mental', power: 16, accuracy: 100, desc: 'A quiet pulse.' },
  neurospike: { id: 'neurospike', name: 'Neurospike', type: 'mental', power: 26, accuracy: 90, desc: '30% chance to confuse.',
    statusInflict: { type: 'confuse', chance: 0.3, duration: 2, value: 0 } },
  mind_lance: { id: 'mind_lance', name: 'Mind Lance', type: 'mental', power: 28, accuracy: 95, ignoresDefense: 0.7, desc: 'Ignores 70% defense.' },
  mental_t4: { id: 'mental_t4', name: 'Psy-Hammer', type: 'mental', power: 42, accuracy: 90, ignoresDefense: 0.5, desc: 'Cracks the mind.',
    statusInflict: { type: 'confuse', chance: 0.5, duration: 2, value: 0 } },
  mental_t5: { id: 'mental_t5', name: 'Soul Splice', type: 'mental', power: 58, accuracy: 85, ignoresDefense: 0.8, desc: 'Bypasses armor.' },

  // ============== signatures (weapon-locked) ==============
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
