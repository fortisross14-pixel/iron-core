export type ItemEffectType = 'heal' | 'shield' | 'buff_atk' | 'recharge';

export interface ItemEffect {
  type: ItemEffectType;
  value: number;
  dur?: number;
}

export interface Item {
  id: string;
  name: string;
  price: number;
  desc: string;
  effect: ItemEffect;
}

export const ITEMS: Record<string, Item> = {
  repair_kit:        { id: 'repair_kit',        name: 'Repair Kit',         price: 200,  desc: 'Restore 50% HP.',                  effect: { type: 'heal',     value: 0.5 } },
  shield_cell:       { id: 'shield_cell',       name: 'Shield Cell',        price: 350,  desc: '+50% DEF for 3 turns.',            effect: { type: 'shield',   value: 0.5, dur: 3 } },
  overclock:         { id: 'overclock',         name: 'Overclock Chip',     price: 400,  desc: '+30% ATK for 3 turns.',            effect: { type: 'buff_atk', value: 0.3, dur: 3 } },
  small_battery_kit: { id: 'small_battery_kit', name: 'Small Battery Kit',  price: 150,  desc: 'Restore 50 battery.',              effect: { type: 'recharge', value: 50 } },
  battery_kit:       { id: 'battery_kit',       name: 'Battery Kit',        price: 400,  desc: 'Restore 150 battery.',             effect: { type: 'recharge', value: 150 } },
  heavy_battery_kit: { id: 'heavy_battery_kit', name: 'Heavy Battery Kit',  price: 1200, desc: 'Restore battery to full.',         effect: { type: 'recharge', value: 9999 } },
};
