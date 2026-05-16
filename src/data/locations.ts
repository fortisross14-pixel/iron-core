/**
 * World structure: cities → locations (buildings/areas within a city).
 *
 * Hometown (Ironhaven) is unlocked at the start. Other cities/locations are
 * gated by story progress and won battles.
 *
 * Each location has zero or more EVENTS. Events are battles, shops, story
 * triggers, or repeatable grinds. The screen for a location is registered
 * separately in App.tsx so each can be its own React component.
 */

import type { FactionId } from './factions';

export interface City {
  id: string;
  name: string;
  region: string;
  desc: string;
  locked: boolean;       // unlocked dynamically; this is just the initial state
}

export type LocationKind =
  | 'home'           // player's house — story dialogues, sleep, save
  | 'workshop'       // uncle's place
  | 'market'         // buy/sell
  | 'gate'           // exit fight (Krait, etc.)
  | 'junkyard'       // wild grinder
  | 'academy'        // high school tournament
  | 'tournament_hall'// official circuit registration
  | 'faction_house'  // faction-aligned building (one per faction in city 2)
  | 'square'         // city center, hub area
  | 'guild';         // wandering Operators

export interface LocationData {
  id: string;
  cityId: string;
  name: string;
  kind: LocationKind;
  desc: string;
  shortDesc: string;        // one-line tagline shown on the city map
  factionAlignment?: FactionId;
  // a location is visitable iff requires.* are all true in the game state
  requires: {
    storyFlags?: string[];          // all of these flags must be set
    location?: string;              // this other location must have been visited
  };
}

// ============================================================
// CITY 1 — IRONHAVEN (hometown)
// ============================================================

export const CITIES: Record<string, City> = {
  ironhaven: {
    id: 'ironhaven',
    name: 'Ironhaven',
    region: 'Hometown',
    desc: 'A foundry town with a school, a market, and a road out.',
    locked: false,
  },
  voltspire: {
    id: 'voltspire',
    name: 'Voltspire',
    region: 'Storm City',
    desc: 'A larger city, two days east. Faction houses, official circuit.',
    locked: true,        // unlocks after Junkyard milestone
  },
};

export const LOCATIONS: Record<string, LocationData> = {
  // ---- IRONHAVEN ----
  iron_home: {
    id: 'iron_home',
    cityId: 'ironhaven',
    name: 'Your House',
    kind: 'home',
    desc: 'Your room is small. There is a poster of the last Apex champion on the wall.',
    shortDesc: 'Where you grew up.',
    requires: {},
  },
  iron_workshop: {
    id: 'iron_workshop',
    cityId: 'ironhaven',
    name: "Uncle's Workshop",
    kind: 'workshop',
    desc: 'Your uncle\'s workshop smells like ozone and machine oil. He builds mechs here on commission.',
    shortDesc: 'Your uncle\'s mecha shop.',
    requires: {},
  },
  iron_market: {
    id: 'iron_market',
    cityId: 'ironhaven',
    name: 'Ironhaven Market',
    kind: 'market',
    desc: 'A handful of stalls along the main street. Weapons, armor, disks, repair kits.',
    shortDesc: 'Buy and sell.',
    requires: {},
  },
  iron_academy: {
    id: 'iron_academy',
    cityId: 'ironhaven',
    name: 'Ironhaven Academy',
    kind: 'academy',
    desc: 'The high school. There\'s a small tournament arena out back where graduating seniors face off.',
    shortDesc: 'Your old high school.',
    requires: {},
  },
  iron_gate: {
    id: 'iron_gate',
    cityId: 'ironhaven',
    name: "Smelter's Gate",
    kind: 'gate',
    desc: 'The east road out of Ironhaven. A heavy-set man is leaning against the gate post.',
    shortDesc: 'The road out of town.',
    requires: {},
  },
  iron_junkyard: {
    id: 'iron_junkyard',
    cityId: 'ironhaven',
    name: 'The Junkyard',
    kind: 'junkyard',
    desc: 'A scrap field outside town. Old abandoned mechas wander here, half-feral. Krait sent you to train.',
    shortDesc: 'Train against abandoned mechs.',
    requires: { storyFlags: ['krait_defeated_player'] },
  },

  // ---- VOLTSPIRE ----
  // Unlocked after the player wins at Smelter's Gate (rematch with Krait).
  volt_square: {
    id: 'volt_square',
    cityId: 'voltspire',
    name: 'Voltspire Square',
    kind: 'square',
    desc: 'The city center. Storm pylons crackle overhead. Three faction houses ring the plaza.',
    shortDesc: 'The plaza. All roads meet here.',
    requires: { storyFlags: ['krait_rematch_won'] },
  },
  volt_market: {
    id: 'volt_market',
    cityId: 'voltspire',
    name: 'Voltspire Market',
    kind: 'market',
    desc: 'Better selection than Ironhaven. Real weapons, rare disks, contract chips for new chassis.',
    shortDesc: 'Bigger market. Better stock.',
    requires: { storyFlags: ['krait_rematch_won'] },
  },
  volt_tournament: {
    id: 'volt_tournament',
    cityId: 'voltspire',
    name: 'Voltspire Tournament Hall',
    kind: 'tournament_hall',
    desc: 'The official circuit\'s eastern hub. Bronze through Gold leagues run here every season.',
    shortDesc: 'Official tournament registration.',
    requires: { storyFlags: ['krait_rematch_won'] },
  },
  volt_natures: {
    id: 'volt_natures',
    cityId: 'voltspire',
    name: "Nature's Own Grove",
    kind: 'faction_house',
    factionAlignment: 'naturesOwn',
    desc: 'A walled garden inside the city. Old bio-frames graze in the back. The Grove-Keeper greets you without standing up.',
    shortDesc: "Faction house · Nature's Own.",
    requires: { storyFlags: ['krait_rematch_won'] },
  },
  volt_elemental: {
    id: 'volt_elemental',
    cityId: 'voltspire',
    name: 'The Elementalist Camp',
    kind: 'faction_house',
    factionAlignment: 'elementalists',
    desc: 'A circle of wagons just inside the western wall. Smoke, water-pumps, salt-burned banners. The Convergence is in town this season.',
    shortDesc: 'Faction house · The Elementalists.',
    requires: { storyFlags: ['krait_rematch_won'] },
  },
  volt_industrial: {
    id: 'volt_industrial',
    cityId: 'voltspire',
    name: 'The Industrial Hall',
    kind: 'faction_house',
    factionAlignment: 'industrials',
    desc: 'A clean stone building with a brass door. A receptionist takes your name on a paper ledger.',
    shortDesc: 'Faction house · The Industrials.',
    requires: { storyFlags: ['krait_rematch_won'] },
  },
};

export const LOCATIONS_BY_CITY = (cityId: string): LocationData[] =>
  Object.values(LOCATIONS).filter(l => l.cityId === cityId);
