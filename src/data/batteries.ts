/**
 * BATTERIES — equipment slot for mecha power cells.
 *
 * Determines a bot's maximum battery capacity. Every bot ships with a
 * `standard_cell` (50 cap) built in. Players can upgrade via shops.
 *
 * When a bot switches batteries, current battery is preserved (capped to the
 * new max) — no penalty for upgrading mid-tournament.
 *
 * Like weapons and armor, batteries are stored in state.batteryInv and
 * assigned via the assign-items flow.
 */

export interface Battery {
  id: string;
  name: string;
  /** Maximum battery capacity this cell provides. */
  capacity: number;
  /** Shop price. The standard cell is `0` because every bot starts with one. */
  price: number;
  desc: string;
}

export const BATTERIES: Record<string, Battery> = {
  standard_cell: {
    id: 'standard_cell',
    name: 'Standard Cell',
    capacity: 50,
    price: 0,
    desc: 'Factory-issue. Built into every chassis. About 5 basic strikes.',
  },
  reinforced_cell: {
    id: 'reinforced_cell',
    name: 'Reinforced Cell',
    capacity: 100,
    price: 600,
    desc: 'Double capacity. Standard upgrade for serious fighters.',
  },
  heavy_cell: {
    id: 'heavy_cell',
    name: 'Heavy Cell',
    capacity: 200,
    price: 2500,
    desc: 'Industrial battery. Enables sustained high-tier attacks.',
  },
  industrial_cell: {
    id: 'industrial_cell',
    name: 'Industrial Cell',
    capacity: 350,
    price: 8000,
    desc: 'Professional circuit standard. Two signatures worth of capacity.',
  },
  tournament_cell: {
    id: 'tournament_cell',
    name: 'Tournament Cell',
    capacity: 500,
    price: 22000,
    desc: 'Elite-tier capacity. Built for long bracket fights.',
  },
  legendary_core: {
    id: 'legendary_core',
    name: 'Legendary Power Core',
    capacity: 750,
    price: 60000,
    desc: 'Mythic-tier energy reserve. Spam signatures all match.',
  },
};

/** Look up a battery by id, fallback to standard. */
export function getBattery(id: string | null | undefined): Battery {
  if (!id) return BATTERIES.standard_cell;
  return BATTERIES[id] ?? BATTERIES.standard_cell;
}
