export interface Rank {
  id: string;
  name: string;
  order: number;
  color: string;
  next: string | null;
  threshold: number | null;       // wins needed to promote
}

export const RANKS: Rank[] = [
  { id: 'rookie',     name: 'ROOKIE',     order: 0, color: '#888',    next: 'competitor', threshold: 3 },
  { id: 'competitor', name: 'COMPETITOR', order: 1, color: '#7fb069', next: 'contender',  threshold: 5 },
  { id: 'contender',  name: 'CONTENDER',  order: 2, color: '#7df0ff', next: 'pro',        threshold: 6 },
  { id: 'pro',        name: 'PRO',        order: 3, color: '#ff6b35', next: 'elite',      threshold: 7 },
  { id: 'elite',      name: 'ELITE',      order: 4, color: '#c896ff', next: 'apex',       threshold: 8 },
  { id: 'apex',       name: 'APEX',       order: 5, color: '#ffd700', next: null,         threshold: null },
];

export const getRank = (id: string): Rank => RANKS.find(r => r.id === id) ?? RANKS[0];
