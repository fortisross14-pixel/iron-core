/**
 * LOCATIONS — back-compat facade.
 *
 * The source of truth is now /data/places/*.ts and /data/cities.ts.
 * This file derives the legacy LocationData/City shape from them so existing
 * screens don't need to change.
 *
 * New code should import directly from /data/places and /data/cities.
 * This facade is here to keep the migration small.
 */

import type { FactionId } from './factions';
import { CITIES as NEW_CITIES } from './cities';
import type { City as NewCity } from './cities';
import { ALL_PLACES, placesForCity } from './places';
import type { Place } from './places';

// Legacy LocationKind: the visual category. Derived from Place.kind + a
// per-place "viewId" override for special story places (home, workshop, etc).
export type LocationKind =
  | 'home' | 'workshop' | 'market' | 'gate' | 'junkyard'
  | 'academy' | 'tournament_hall' | 'faction_house' | 'officials_hall'
  | 'square' | 'guild';

export interface City {
  id: string;
  name: string;
  region: string;
  desc: string;
  locked: boolean;
}

export interface LocationData {
  id: string;
  cityId: string;
  name: string;
  kind: LocationKind;
  desc: string;
  shortDesc: string;
  factionAlignment?: FactionId;
  requires: { storyFlags?: string[]; location?: string };
}

// Map from new Place to legacy LocationKind based on id/kind heuristics.
// Per-place overrides for the screen routing.
function placeToLegacyKind(p: Place): LocationKind {
  // Hard-coded view overrides for special places that have dedicated screens
  if (p.id === 'iron_home') return 'home';
  if (p.id === 'iron_workshop') return 'workshop';
  if (p.id === 'iron_gate') return 'gate';
  if (p.id === 'volt_square' || p.id === 'holl_square') return 'square';

  // Generic by kind
  switch (p.kind) {
    case 'story_place':    return 'home';          // fallback; specific ids above override
    case 'grind_place':    return 'junkyard';
    case 'fight_story':    return 'gate';
    case 'tournament':
      // tournament places: route to specialized view
      if (p.id === 'iron_academy') return 'academy';
      if (p.id === 'holl_officials') return 'officials_hall';
      return 'tournament_hall';
    case 'store':          return 'market';
    case 'faction_house':  return 'faction_house';
    case 'other':          return 'home';
  }
}

function placeToLocationData(p: Place): LocationData {
  return {
    id: p.id,
    cityId: p.cityId,
    name: p.name,
    kind: placeToLegacyKind(p),
    desc: p.desc,
    shortDesc: p.shortDesc,
    factionAlignment: p.kind === 'faction_house' ? p.factionId : undefined,
    requires: {
      storyFlags: p.requires?.storyFlags,
    },
  };
}

function cityToLegacyCity(c: NewCity): City {
  return {
    id: c.id,
    name: c.name,
    region: c.region,
    desc: c.desc,
    locked: c.locked,
  };
}

export const CITIES: Record<string, City> = Object.fromEntries(
  Object.values(NEW_CITIES).map(c => [c.id, cityToLegacyCity(c)]),
);

export const LOCATIONS: Record<string, LocationData> = Object.fromEntries(
  ALL_PLACES.map(p => [p.id, placeToLocationData(p)]),
);

export function LOCATIONS_BY_CITY(cityId: string): LocationData[] {
  return placesForCity(cityId).map(placeToLocationData);
}
