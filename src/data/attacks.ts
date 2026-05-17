/**
 * ATTACKS — central registry.
 *
 * Rebalanced power-per-battery ladder. Each tier is meaningfully stronger
 * than the previous AND more efficient relative to its cost. Basic strike
 * is the reliable baseline; type attacks are strictly upgrades when you can
 * afford them and especially against type weaknesses.
 *
 * Power vs battery cost reference:
 *   basic_strike    18 power / 5 bat   = 3.6 pow/bat   (baseline reliable)
 *   type_T1 (LV2)   28 power / 10 bat  = 2.8 pow/bat   (less efficient, but +56% raw power)
 *   type_T2 (LV4)   38 power / 15 bat  = 2.5 pow/bat   (+36% over T1)
 *   type_T3 (LV7)   48 power / 25 bat  = 1.9 pow/bat   (+26% over T2, status effects)
 *   type_T4 (LV12)  62 power / 40 bat  = 1.55 pow/bat  (+29% over T3)
 *   type_T5 (LV20)  85 power / 65 bat  = 1.31 pow/bat  (+37% over T4, finisher)
 *   signature       110 power / 100 bat = 1.1 pow/bat  (weapon-locked, round 3+)
 *
 * Type effectiveness (1.5x-2x) multiplies POWER, not cost — so against a
 * type weakness, a T1 attack effectively becomes 42-56 power. That's why
 * specialized attacks shine vs the right opponent and basic_strike is the
 * fallback when matchups are bad or battery is low.
 *
 * Out-of-battery: if a bot's current battery < attack.batteryCost, the attack
 * is locked. Basic Strike (5 cost) is the cheapest baseline.
 *
 * Special attack flags:
 *   - selfTarget:    Attack targets the caster instead of an enemy
 *   - allyTarget:    Attack targets an ALLY (not enemy, not self)
 *   - chargeRestore: Amount of battery restored to the target (for support moves)
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
  /** Battery consumed when this attack is cast. */
  batteryCost: number;
  speedBonus?: number;
  lifesteal?: number;
  ignoresDefense?: number;
  statusInflict?: StatusInflict;
  isSignature?: boolean;
  /** If true, the attack targets an ally (not enemy). */
  allyTarget?: boolean;
  /** Battery restored to the target. Used by Replenish Charge. */
  chargeRestore?: number;
}

export const ATTACKS: Record<string, Attack> = {
  // ============== universal physical ==============
  basic_strike: { id: 'basic_strike', name: 'Basic Strike', type: 'physical', power: 18, accuracy: 95, batteryCost: 5, desc: 'Reliable melee. Always available.' },
  quick_jab:    { id: 'quick_jab',    name: 'Quick Jab',    type: 'physical', power: 14, accuracy: 100, batteryCost: 5, speedBonus: 4, desc: 'Fast strike, never misses.' },
  heavy_blow:   { id: 'heavy_blow',   name: 'Heavy Blow',   type: 'physical', power: 32, accuracy: 80, batteryCost: 10, desc: 'Slow but powerful.' },
  brace:        { id: 'brace',        name: 'Brace',        type: 'physical', power: 0, accuracy: 100, batteryCost: 5, desc: '+30% DEF this round.' },

  // ============== fire ==============
  fire_t1:      { id: 'fire_t1',     name: 'Ember',        type: 'fire', power: 28, accuracy: 100, batteryCost: 10, desc: 'A controlled flame.' },
  ember_punch:  { id: 'ember_punch', name: 'Ember Punch',  type: 'fire', power: 38, accuracy: 95, batteryCost: 15, desc: 'Heated strike.' },
  cinder_burst: { id: 'cinder_burst', name: 'Cinder Burst', type: 'fire', power: 48, accuracy: 90, batteryCost: 25, desc: 'Burns over 3 turns.',
    statusInflict: { type: 'burn', chance: 0.7, duration: 3, value: 8 } },
  fire_t4:      { id: 'fire_t4',     name: 'Magma Coil',   type: 'fire', power: 62, accuracy: 85, batteryCost: 40, desc: 'Wraps the enemy in heat.',
    statusInflict: { type: 'burn', chance: 0.5, duration: 3, value: 10 } },
  fire_t5:      { id: 'fire_t5',     name: 'Solar Lance',  type: 'fire', power: 85, accuracy: 80, batteryCost: 65, desc: 'Concentrated thermal beam.' },

  // ============== water ==============
  water_t1:    { id: 'water_t1',  name: 'Splash',       type: 'water', power: 26, accuracy: 100, batteryCost: 10, desc: 'Pressurized stream.' },
  water_jet:   { id: 'water_jet', name: 'Water Jet',    type: 'water', power: 38, accuracy: 100, batteryCost: 15, desc: 'High-velocity jet.' },
  tide_cannon: { id: 'tide_cannon', name: 'Tide Cannon', type: 'water', power: 48, accuracy: 90, batteryCost: 25, desc: 'Concussive blast.' },
  water_t4:    { id: 'water_t4',  name: 'Pressure Wave', type: 'water', power: 62, accuracy: 85, batteryCost: 40, desc: 'Crushing volume of water.',
    statusInflict: { type: 'slow', chance: 0.6, duration: 2, value: 5 } },
  water_t5:    { id: 'water_t5',  name: 'Maelstrom',    type: 'water', power: 82, accuracy: 80, batteryCost: 65, desc: 'A turning sea.' },

  // ============== lightning ==============
  lightning_t1: { id: 'lightning_t1', name: 'Static',    type: 'lightning', power: 26, accuracy: 100, batteryCost: 10, speedBonus: 2, desc: 'A small charge.' },
  spark:       { id: 'spark',       name: 'Spark',      type: 'lightning', power: 36, accuracy: 100, batteryCost: 15, speedBonus: 3, desc: 'Quick arc.' },
  thunderfork: { id: 'thunderfork', name: 'Thunderfork', type: 'lightning', power: 46, accuracy: 95, batteryCost: 25, speedBonus: 6, desc: 'Storm rod.' },
  lightning_t4: { id: 'lightning_t4', name: 'Volt Lance', type: 'lightning', power: 60, accuracy: 90, batteryCost: 40, speedBonus: 5, desc: 'Concentrated bolt.',
    statusInflict: { type: 'stun', chance: 0.3, duration: 1, value: 0 } },
  lightning_t5: { id: 'lightning_t5', name: 'Thundercrash', type: 'lightning', power: 82, accuracy: 85, batteryCost: 65, speedBonus: 8, desc: 'Storm-rending strike.' },
  // SUPPORT: ally-targeting battery transfer. Learned at LV12 by all lightning mechas.
  replenish_charge: {
    id: 'replenish_charge', name: 'Replenish Charge', type: 'lightning',
    power: 0, accuracy: 100, batteryCost: 20,
    allyTarget: true, chargeRestore: 50,
    desc: 'Transfer 50 battery to an ally. Cannot self-target.',
  },

  // ============== ice ==============
  ice_t1:      { id: 'ice_t1',    name: 'Chill',       type: 'ice', power: 26, accuracy: 100, batteryCost: 10, desc: 'A cold draft.' },
  frost_jab:   { id: 'frost_jab', name: 'Frost Jab',   type: 'ice', power: 38, accuracy: 95, batteryCost: 15, desc: 'Cold strike.' },
  frostbite:   { id: 'frostbite', name: 'Frostbite',   type: 'ice', power: 44, accuracy: 100, batteryCost: 25, desc: 'Always slows.',
    statusInflict: { type: 'slow', chance: 1.0, duration: 3, value: 6 } },
  ice_t4:      { id: 'ice_t4',    name: 'Ice Spear',   type: 'ice', power: 60, accuracy: 90, batteryCost: 40, desc: 'Sharp frozen lance.',
    statusInflict: { type: 'slow', chance: 0.7, duration: 3, value: 6 } },
  ice_t5:      { id: 'ice_t5',    name: 'Glacier Drop', type: 'ice', power: 82, accuracy: 80, batteryCost: 65, desc: 'Falling mass of ice.',
    statusInflict: { type: 'stun', chance: 0.4, duration: 1, value: 0 } },

  // ============== earth ==============
  earth_t1:    { id: 'earth_t1',    name: 'Pebble',     type: 'earth', power: 28, accuracy: 100, batteryCost: 10, desc: 'Small thrown rock.' },
  stone_fist:  { id: 'stone_fist',  name: 'Stone Fist', type: 'earth', power: 40, accuracy: 90, batteryCost: 15, desc: 'Rocky knuckle.' },
  quake_slam:  { id: 'quake_slam',  name: 'Quake Slam', type: 'earth', power: 50, accuracy: 80, batteryCost: 25, desc: 'Ground-shaker.' },
  earth_t4:    { id: 'earth_t4',    name: 'Rockfall',   type: 'earth', power: 64, accuracy: 80, batteryCost: 40, desc: 'Crushing debris.',
    statusInflict: { type: 'armor_break', chance: 0.5, duration: 3, value: 0.3 } },
  earth_t5:    { id: 'earth_t5',    name: 'Tectonic Slam', type: 'earth', power: 88, accuracy: 75, batteryCost: 65, desc: 'Continent-cracker.' },

  // ============== bio ==============
  bio_t1:      { id: 'bio_t1',     name: 'Spore Mist',  type: 'bio', power: 24, accuracy: 100, batteryCost: 10, desc: 'A puff of toxin.' },
  spore_lash:  { id: 'spore_lash', name: 'Spore Lash',  type: 'bio', power: 34, accuracy: 100, batteryCost: 15, desc: 'Vine whip.',
    statusInflict: { type: 'poison', chance: 0.4, duration: 3, value: 5 } },
  rot_touch:   { id: 'rot_touch',  name: 'Rot Touch',   type: 'bio', power: 44, accuracy: 90, batteryCost: 25, desc: 'Spreading decay.',
    statusInflict: { type: 'poison', chance: 0.8, duration: 3, value: 8 } },
  bio_t4:      { id: 'bio_t4',     name: 'Bramble Coil', type: 'bio', power: 58, accuracy: 85, batteryCost: 40, desc: 'Constricting growth.',
    statusInflict: { type: 'poison', chance: 0.6, duration: 4, value: 9 } },
  bio_t5:      { id: 'bio_t5',     name: 'World-Vine',  type: 'bio', power: 80, accuracy: 80, batteryCost: 65, desc: 'A primal binding.', lifesteal: 0.25 },

  // ============== steel ==============
  steel_t1:    { id: 'steel_t1',  name: 'Bolt Throw',   type: 'steel', power: 28, accuracy: 100, batteryCost: 10, desc: 'A driven nail.' },
  rivet_punch: { id: 'rivet_punch', name: 'Rivet Punch', type: 'steel', power: 40, accuracy: 95, batteryCost: 15, desc: 'Industrial strike.' },
  piston_slam: { id: 'piston_slam', name: 'Piston Slam', type: 'steel', power: 50, accuracy: 90, batteryCost: 25, desc: 'Hydraulic impact.' },
  steel_t4:    { id: 'steel_t4',   name: 'Hammer Coil', type: 'steel', power: 64, accuracy: 85, batteryCost: 40, desc: 'Mechanized blow.',
    statusInflict: { type: 'armor_break', chance: 0.6, duration: 3, value: 0.25 } },
  steel_t5:    { id: 'steel_t5',   name: 'Forge Cannon', type: 'steel', power: 88, accuracy: 80, batteryCost: 65, desc: 'Industrial finisher.' },

  // ============== mental ==============
  mental_t1:   { id: 'mental_t1',  name: 'Mind Spark',  type: 'mental', power: 26, accuracy: 100, batteryCost: 10, desc: 'A psionic flicker.' },
  neurospike:  { id: 'neurospike', name: 'Neurospike',  type: 'mental', power: 38, accuracy: 95, batteryCost: 15, desc: 'Sharp mental jab.' },
  mind_lance:  { id: 'mind_lance', name: 'Mind Lance',  type: 'mental', power: 48, accuracy: 90, batteryCost: 25, desc: 'A piercing thought.',
    statusInflict: { type: 'confuse', chance: 0.5, duration: 2, value: 0 } },
  mental_t4:   { id: 'mental_t4',  name: 'Brain Storm', type: 'mental', power: 60, accuracy: 85, batteryCost: 40, desc: 'Crushing mindwave.',
    statusInflict: { type: 'confuse', chance: 0.6, duration: 3, value: 0 } },
  mental_t5:   { id: 'mental_t5',  name: 'Mind Crush',  type: 'mental', power: 82, accuracy: 80, batteryCost: 65, desc: 'The thought becomes a weapon.',
    statusInflict: { type: 'stun', chance: 0.35, duration: 1, value: 0 } },

  // ============== signatures (weapon-locked) ==============
  sig_fire:      { id: 'sig_fire',      name: 'Sun Dive',       type: 'fire',      power: 110, accuracy: 100, batteryCost: 100, isSignature: true, desc: 'Signature: falling sun.' },
  sig_water:     { id: 'sig_water',     name: 'Tidal Sovereign', type: 'water',     power: 110, accuracy: 100, batteryCost: 100, isSignature: true, desc: 'Signature: drowning wave.' },
  sig_lightning: { id: 'sig_lightning', name: 'Levin Verdict',  type: 'lightning', power: 110, accuracy: 100, batteryCost: 100, isSignature: true, speedBonus: 10, desc: 'Signature: judgement-bolt.' },
  sig_ice:       { id: 'sig_ice',       name: 'Absolute Zero',  type: 'ice',       power: 110, accuracy: 100, batteryCost: 100, isSignature: true, desc: 'Signature: time-stopping frost.' },
  sig_earth:     { id: 'sig_earth',     name: 'Mountain Drop',  type: 'earth',     power: 110, accuracy: 100, batteryCost: 100, isSignature: true, desc: 'Signature: literal mountain.' },
  sig_bio:       { id: 'sig_bio',       name: 'World-Devourer', type: 'bio',       power: 110, accuracy: 100, batteryCost: 100, isSignature: true, lifesteal: 0.4, desc: 'Signature: consuming bloom.' },
  sig_steel:     { id: 'sig_steel',     name: 'Industrial End', type: 'steel',     power: 110, accuracy: 100, batteryCost: 100, isSignature: true, desc: 'Signature: forge collapse.' },
  sig_mental:    { id: 'sig_mental',    name: 'Mind Eraser',    type: 'mental',    power: 110, accuracy: 100, batteryCost: 100, isSignature: true, desc: 'Signature: thought void.' },
};
