/**
 * CITIES — top-level world map manifest.
 *
 * Each city has a tier (village/town/city). Cities have two descriptions:
 *   - shortDesc: 1 line, shown on the world map row
 *   - longDesc:  2-3 sentences, shown at the top of the town view
 *
 * The actual places located in each city live in /data/places/*.ts.
 */

export type CityTier = 'village' | 'town' | 'city';

export interface City {
  id: string;
  name: string;
  region: string;                  // short subtitle ("Hometown", "Storm City")
  tier: CityTier;
  /** Type theme — drives wild mecha pool, faction biases, color cues. */
  theme: 'steel' | 'lightning' | 'water' | 'fire';
  /** 1-line description shown in the world map row (~10-14 words). */
  shortDesc: string;
  /** 2-3 sentence description shown at top of the town view (~40-80 words). */
  longDesc: string;
  /** @deprecated kept for backwards-compat; same content as shortDesc */
  desc: string;
  locked: boolean;                 // initial state; runtime unlock lives in state.unlockedCities
}

export const CITIES: Record<string, City> = {
  ironhaven: {
    id: 'ironhaven',
    name: 'Ironhaven',
    region: 'Hometown',
    tier: 'village',
    theme: 'steel',
    shortDesc: 'A foundry village. Iron, smoke, and your family.',
    longDesc: 'Ironhaven sits between the western hills and the Smelter\'s Gate. The whole village runs on the foundry — half the population works the line, the other half ships the metal out. Wild mechas around here are mostly old factory frames gone feral, salvageable for parts. Your uncle\'s workshop and the Academy are at the top of the hill. The road east leads to Voltspire, if you can get past the gate.',
    desc: 'A foundry village. Iron, smoke, and your family.',
    locked: false,
  },
  voltspire: {
    id: 'voltspire',
    name: 'Voltspire',
    region: 'Storm Town',
    tier: 'town',
    theme: 'lightning',
    shortDesc: 'Storm-powered town. Three factions, one circuit.',
    longDesc: 'Voltspire was built around the storm pylons — vast metal spires that draw lightning from the perpetual cloud cover and feed it into the town\'s grid. The three factions all keep houses here, but none of them will sign you until the gatekeeper passes you. The Storm Fields beyond the wall crackle with wild lightning mechas; the Circuit holds the town\'s tournaments.',
    desc: 'Storm-powered town. Three factions, one circuit.',
    locked: true,
  },
  emberbold: {
    id: 'emberbold',
    name: 'Emberbold',
    region: 'Volcanic Town',
    tier: 'town',
    theme: 'fire',
    shortDesc: 'A town built on a volcanic shelf. Heat and ash.',
    longDesc: 'Emberbold rises from black volcanic rock, half its buildings carved into old lava tubes. The town\'s wealth comes from geothermal forges — the heat that would kill anywhere else is harnessed here. Fire mechas wander the ash plains outside the walls, and somewhere out there a Magma Drake is keeping the foothills empty. The MFC official-tier gatekeeper makes his home here.',
    desc: 'A town built on a volcanic shelf. Heat and ash.',
    locked: true,
  },
  hollowmere: {
    id: 'hollowmere',
    name: 'Hollowmere',
    region: 'Coastal Trade City',
    tier: 'city',
    theme: 'water',
    shortDesc: 'Bay city of trade and tides. Seat of the MFC.',
    longDesc: 'Hollowmere wraps a deep natural bay on the southern coast. Trade ships move in and out at every tide, and the city\'s wealth made it the natural seat of the Mecha Fighting Club — the league above all leagues, where every serious trainer registers. The bay itself shelters wild water mechas; the deeper inlets are said to hold rares. The MFC tower stands at the harbor mouth like a lighthouse.',
    desc: 'Bay city of trade and tides. Seat of the MFC.',
    locked: true,
  },
};

export const CITY_LIST = Object.values(CITIES);

export const CITY_TIER_LABEL: Record<CityTier, string> = {
  village: 'VILLAGE',
  town: 'TOWN',
  city: 'CITY',
};
