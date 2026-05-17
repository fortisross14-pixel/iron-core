/**
 * Places aggregation.
 *
 * Add a new city:
 *   1. Create /data/places/MyCity.ts exporting MY_CITY_PLACES: Place[]
 *   2. Add to CITY_PLACES below
 *   3. Add the city manifest to /data/cities.ts
 */

import { IRONHAVEN_PLACES } from './Ironhaven';
import { VOLTSPIRE_PLACES } from './Voltspire';
import { EMBERBOLD_PLACES } from './Emberbold';
import { HOLLOWMERE_PLACES } from './Hollowmere';
import type { Place } from './types';

export const CITY_PLACES: Record<string, Place[]> = {
  ironhaven: IRONHAVEN_PLACES,
  voltspire: VOLTSPIRE_PLACES,
  emberbold: EMBERBOLD_PLACES,
  hollowmere: HOLLOWMERE_PLACES,
};

export const ALL_PLACES: Place[] = Object.values(CITY_PLACES).flat();

export const PLACES_BY_ID: Record<string, Place> = Object.fromEntries(
  ALL_PLACES.map(p => [p.id, p]),
);

export function placesForCity(cityId: string): Place[] {
  return CITY_PLACES[cityId] ?? [];
}

export function getPlace(placeId: string): Place | undefined {
  return PLACES_BY_ID[placeId];
}

export type { Place };
