/**
 * CITIES — top-level world map manifest.
 *
 * Each city has a tier (village/town/city) which informs:
 *   - How many tournaments it can host (village: 1-2 amateur + 1 official;
 *     town: 2-3 amateur + 1-2 official + 1 pro + 0-1 elite;
 *     city:  3-5 amateur + 2-3 official + 1-2 pro + 1 elite)
 *   - How big the market is (village: small; town: medium; city: large)
 *   - How many faction houses (village: 0; town: 1-2; city: 2-3)
 *
 * The actual places located in each city live in /data/places/*.ts.
 * This file is a thin manifest — just the city ids, names, tiers, and which
 * places they contain.
 *
 * To add a new city:
 *   1. Add an entry below
 *   2. Create /data/places/MyCity.ts with the places
 *   3. Add to CITIES_PLACES in /data/places/index.ts
 */

export type CityTier = 'village' | 'town' | 'city';

export interface City {
  id: string;
  name: string;
  region: string;                  // short subtitle ("Hometown", "Storm City")
  tier: CityTier;
  desc: string;
  locked: boolean;                 // initial state; runtime unlock lives in state.unlockedCities
}

export const CITIES: Record<string, City> = {
  ironhaven: {
    id: 'ironhaven',
    name: 'Ironhaven',
    region: 'Hometown',
    tier: 'village',
    desc: 'A foundry village with a school, a market, and a road out.',
    locked: false,
  },
  voltspire: {
    id: 'voltspire',
    name: 'Voltspire',
    region: 'Storm City',
    tier: 'town',
    desc: 'A storm-powered town, two days east. Faction houses, official circuit start.',
    locked: true,
  },
  hollowmere: {
    id: 'hollowmere',
    name: 'Hollowmere',
    region: 'Coastal Trade City',
    tier: 'city',
    desc: 'A coastal city of trade and registry. Home of the Officials\' Hall.',
    locked: true,
  },
};

export const CITY_LIST = Object.values(CITIES);

export const CITY_TIER_LABEL: Record<CityTier, string> = {
  village: 'VILLAGE',
  town: 'TOWN',
  city: 'CITY',
};
