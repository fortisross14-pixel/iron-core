import type { MechaType } from './types';

export interface Armor {
  id: string;
  name: string;
  defBonus: number;
  resist: MechaType | null;     // type damage taken is reduced
  price: number;
  desc: string;
}

export const ARMORS: Record<string, Armor> = {
  scrap_plate:   { id: 'scrap_plate',   name: 'Scrap Plate',   defBonus: 4,  resist: null,        price: 500,  desc: 'Basic protection.' },
  reinforced:    { id: 'reinforced',    name: 'Reinforced Hull',defBonus: 8, resist: null,        price: 1500, desc: 'Sturdy generalist.' },
  fire_ward:     { id: 'fire_ward',     name: 'Fire Ward',     defBonus: 6,  resist: 'fire',      price: 1800, desc: 'Resist Fire damage.' },
  storm_ward:    { id: 'storm_ward',    name: 'Storm Ward',    defBonus: 6,  resist: 'lightning', price: 1800, desc: 'Resist Lightning damage.' },
  glacial_ward:  { id: 'glacial_ward',  name: 'Glacial Ward',  defBonus: 6,  resist: 'ice',       price: 1800, desc: 'Resist Ice damage.' },
  titanium_core: { id: 'titanium_core', name: 'Titanium Core', defBonus: 12, resist: null,        price: 4000, desc: 'Top-tier plate.' },
};
