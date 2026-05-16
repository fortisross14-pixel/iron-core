import type { MechaType } from './types';

export interface Weapon {
  id: string;
  name: string;
  type: MechaType | null;       // null = type-agnostic
  atkBonus: number;
  price: number;
  signature: string;            // attack id unlocked
  desc: string;
}

export const WEAPONS: Record<string, Weapon> = {
  iron_fist:     { id: 'iron_fist',     name: 'Iron Fist',     type: null,        atkBonus: 4, price: 600,  signature: 'sig_haymaker',     desc: 'Hydraulic punch. Universal fit.' },
  rail_carbine:  { id: 'rail_carbine',  name: 'Rail Carbine',  type: null,        atkBonus: 6, price: 1400, signature: 'sig_haymaker',     desc: 'Magnetic slug-thrower.' },
  cinder_cannon: { id: 'cinder_cannon', name: 'Cinder Cannon', type: 'fire',      atkBonus: 8, price: 2200, signature: 'sig_magma_lance',  desc: 'Pyrotechnic launcher.' },
  tide_blaster:  { id: 'tide_blaster',  name: 'Tide Blaster',  type: 'water',     atkBonus: 8, price: 2200, signature: 'sig_tsunami',      desc: 'High-pressure cannon.' },
  thunder_rod:   { id: 'thunder_rod',   name: 'Thunder Rod',   type: 'lightning', atkBonus: 8, price: 2200, signature: 'sig_chain_storm',  desc: 'Conductive staff.' },
  cryo_coil:     { id: 'cryo_coil',     name: 'Cryo Coil',     type: 'ice',       atkBonus: 8, price: 2200, signature: 'sig_avalanche',    desc: 'Frostbite emitter.' },
  earth_drill:   { id: 'earth_drill',   name: 'Earth Drill',   type: 'earth',     atkBonus: 8, price: 2200, signature: 'sig_meteor',       desc: 'Spiked piledriver.' },
  spore_caster:  { id: 'spore_caster',  name: 'Spore Caster',  type: 'bio',       atkBonus: 8, price: 2200, signature: 'sig_overgrowth',   desc: 'Living fungal launcher.' },
  sledge_arm:    { id: 'sledge_arm',    name: 'Sledge Arm',    type: 'steel',     atkBonus: 8, price: 2200, signature: 'sig_industrial',   desc: 'Factory-grade press.' },
  neural_emitter:{ id: 'neural_emitter',name: 'Neural Emitter',type: 'mental',    atkBonus: 8, price: 2200, signature: 'sig_mind_shatter', desc: 'Psi broadcaster.' },
};
