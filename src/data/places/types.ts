/**
 * PLACES — buildings/locations within cities.
 *
 * A place is any visitable in-city location. The PlaceKind enumerates the
 * categories you described:
 *
 *   - story_place:    no fight, unlocks events (e.g. uncle's workshop, your home)
 *   - grind_place:    train against wild mechas, get materials/XP, salvage or
 *                     capture (capture mechanic comes in Step 3d). Each grind
 *                     place has 2-3 mecha types in its spawn pool.
 *   - fight_story:    one-off story battles that grant fame/credits and unlock
 *                     more story (e.g. Smelter's Gate vs Krait)
 *   - tournament:     hosts one or more tournaments of various tiers
 *   - store:          buy/sell market with a curated inventory
 *   - faction_house:  per-faction reward fights + collection-based ranking
 *   - other:          unlockable bonus places (post-tournament, post-faction)
 *
 * Visual code lives in /screens/places/<Kind>PlaceView.tsx and reads its
 * config from this file. No screen file hardcodes place ids.
 */

import type { FactionId } from '../factions';

export type PlaceKind =
  | 'story_place'
  | 'grind_place'
  | 'fight_story'
  | 'tournament'
  | 'store'
  | 'faction_house'
  | 'other';

export interface PlaceBase {
  id: string;
  cityId: string;
  name: string;
  shortDesc: string;              // shown in city list
  desc: string;                   // shown on entry; supports atmosphere
  kind: PlaceKind;
  /** Story flags that must be set for this place to be visible in the city. */
  requires?: { storyFlags?: string[]; };
}

// --- story_place
export interface StoryPlace extends PlaceBase {
  kind: 'story_place';
  /** Story scene that triggers when entered. (Optional — many story_places
   *  trigger their scenes via existing useStoryTriggers flow.) */
  entryScene?: string;
}

// --- grind_place
export interface GrindPlace extends PlaceBase {
  kind: 'grind_place';
  /** Wild mecha pool. Each spawn picks a random entry from this list. */
  spawnPool: { modelId: string; weight?: number; minLevel: number; maxLevel: number }[];
  /** Material ids that can drop here. */
  materialPool: string[];
  /** Disk drop chance per fight (e.g. 0.1 = 10%). */
  diskDropChance: number;
  /** Subset of disk ids that can drop here. */
  diskPool: string[];
}

// --- fight_story
export interface FightStoryPlace extends PlaceBase {
  kind: 'fight_story';
  /** Which story scene's pending-battle gets queued on the "fight" button. */
  battleSceneId: string;
}

// --- tournament
export interface TournamentPlace extends PlaceBase {
  kind: 'tournament';
  /** Tournament event ids hosted at this place (defined in /data/tournaments.ts). */
  tournamentIds: string[];
}

// --- store
export interface StorePlace extends PlaceBase {
  kind: 'store';
  /** Item / weapon / armor / disk / mecha ids on sale. The store screen reads
   *  inventory from here and looks up prices/details from their respective
   *  data files. */
  inventory: {
    items?: string[];
    weapons?: string[];
    armors?: string[];
    disks?: string[];
    mechas?: string[];      // (for sale — Step 3c+)
  };
  /** Multiplier on base sell price the player gets when selling here.
   *  (0.4 in village, 0.5 in town, 0.6 in city is typical.) */
  sellMultiplier: number;
}

// --- faction_house
export interface FactionHousePlace extends PlaceBase {
  kind: 'faction_house';
  factionId: FactionId;
  /** Coach ids for the fights this house offers (defined in /data/coaches.ts). */
  challengeCoachIds: string[];
}

// --- other
export interface OtherPlace extends PlaceBase {
  kind: 'other';
  /** Free-form unlock requirement description shown to the player. */
  unlockHint?: string;
}

export type Place =
  | StoryPlace | GrindPlace | FightStoryPlace
  | TournamentPlace | StorePlace | FactionHousePlace | OtherPlace;
