/**
 * The 8 mecha types. Each model has exactly one type.
 * Type chart governs combat effectiveness.
 */

export type MechaType =
  | 'fire'
  | 'water'
  | 'lightning'
  | 'ice'
  | 'earth'
  | 'bio'
  | 'steel'
  | 'mental';

export const MECHA_TYPES: MechaType[] = [
  'fire', 'water', 'lightning', 'ice', 'earth', 'bio', 'steel', 'mental',
];

export interface TypeInfo {
  id: MechaType;
  name: string;
  desc: string;
}

export const TYPE_INFO: Record<MechaType, TypeInfo> = {
  fire:      { id: 'fire',      name: 'Fire',      desc: 'Heat-core frames. High burst, low durability.' },
  water:     { id: 'water',     name: 'Water',     desc: 'Pressure systems. Steady damage, good against fire.' },
  lightning: { id: 'lightning', name: 'Lightning', desc: 'Electric drives. Fastest of the eight.' },
  ice:       { id: 'ice',       name: 'Ice',       desc: 'Cryo systems. Slowing field effects.' },
  earth:     { id: 'earth',     name: 'Earth',     desc: 'Stone and rebar. Tank archetype.' },
  bio:       { id: 'bio',       name: 'Bio',       desc: 'Organic-hybrid. Self-healing.' },
  steel:     { id: 'steel',     name: 'Steel',     desc: 'Industrial machine frames. Reliable.' },
  mental:    { id: 'mental',    name: 'Mental',    desc: 'Psi-conductors. Bypass armor.' },
};

/**
 * Type chart: attacker.type vs defender.type → damage multiplier.
 * Anything unlisted = 1.0 (neutral).
 * 1.6 = super effective. 0.6 = resisted.
 */
export const TYPE_CHART: Record<MechaType, Partial<Record<MechaType, number>>> = {
  fire:      { bio: 1.6, ice: 1.6, steel: 1.4, water: 0.6, earth: 0.6 },
  water:     { fire: 1.6, earth: 1.4, lightning: 0.6, bio: 0.6 },
  lightning: { water: 1.6, steel: 1.4, mental: 1.6, earth: 0.6, bio: 0.6 },
  ice:       { bio: 1.6, earth: 1.6, fire: 0.6, lightning: 0.6 },
  earth:     { lightning: 1.6, fire: 1.6, steel: 1.4, water: 0.6 },
  bio:       { water: 1.6, mental: 1.6, fire: 0.6, ice: 0.6, lightning: 0.6, steel: 0.6 },
  steel:     { ice: 1.6, bio: 1.4, fire: 0.6, lightning: 0.6 },
  mental:    { steel: 0.6, bio: 0.6, lightning: 0.6 },
};

export function getEffectiveness(atk: MechaType, def: MechaType): number {
  return TYPE_CHART[atk]?.[def] ?? 1.0;
}

export function effectivenessLabel(mult: number): string | null {
  if (mult >= 1.5) return 'SUPER EFFECTIVE';
  if (mult >= 1.2) return 'EFFECTIVE';
  if (mult <= 0.7) return 'RESISTED';
  return null;
}
