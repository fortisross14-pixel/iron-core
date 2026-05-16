export const FIRST_NAME_POOL = [
  'Vigir', 'Kell', 'Asha', 'Renn', 'Mira', 'Tarek', 'Sable', 'Bex', 'Cyon',
  'Drust', 'Vera', 'Onyx', 'Junip', 'Mavi', 'Hex', 'Thane', 'Lira', 'Quin',
  'Roa', 'Brak', 'Ember', 'Cinder', 'Ash', 'Wrack',
];

export function suggestFirstName(): string {
  return FIRST_NAME_POOL[Math.floor(Math.random() * FIRST_NAME_POOL.length)];
}

export const OPPONENT_FIRST_NAMES = [
  'Junkyard', 'Razor', 'Mad', 'Wrack', 'Hex', 'Brick',
  'Hollow', 'Glass', 'Echo', 'Hook', 'Nail', 'Pale',
];
