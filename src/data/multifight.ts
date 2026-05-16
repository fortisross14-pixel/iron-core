/**
 * MULTI-FIGHT EVENT — generic schema.
 *
 * Any sequence of fights presented as a vertical list (tournament,
 * tier test, gauntlet, dungeon) uses this shape.
 *
 * The MultiFightEventView component renders any event of this shape:
 *   - vertical list of fights, top to bottom
 *   - first locked fight is the "next up" (unlocked)
 *   - cleared fights show a ✓ and a green border
 *   - locked fights show a 🔒
 *   - tapping the unlocked fight launches it
 *
 * Each fight references a trainer (for fame attribution) and has its
 * own per-fight rewards. The event has overall champion bonuses.
 *
 * Progress tracking lives in state.eventProgress: a map of
 * eventId → highest cleared fight index (zero-based). -1 means none cleared.
 *
 * --------
 * For event TEXT (intro line, hall description, examiner flavor), see
 * data/eventCopy.ts. Visual code never hardcodes text.
 */

import type { TrainerTier } from './trainers';

export interface EventFight {
  trainerId?: string;          // for fame attribution (optional — falls back to generic opponent)
  oppLevel: number;
  teamSize?: number;           // override event-level teamSize if needed
  fameOnWin: number;
  prizeOnWin: number;
  xpOnWin: number;
  /** Per-fight subtitle shown under the trainer name, e.g. "Fire/Steel Examiner". */
  subtitle?: string;
}

export type EventKind =
  | 'tournament'    // wins a championship; can usually be re-entered
  | 'tier_test'     // gates a tier promotion; one-time success
  | 'gauntlet';     // generic chained event

export interface MultiFightEvent {
  id: string;
  kind: EventKind;
  name: string;                // e.g. "Senior Cup", "Official Test"
  hostLocationId: string;      // where you sign up
  /** Tier of the tournament. Determines who can enter:
   *  - amateur: any player tier (amateur+)
   *  - official: player must be at least Official
   *  - professional: player must be at least Professional
   *  - elite: player must be Elite
   *  tier_test events have their own gate logic in requires.storyFlags/minFame
   *  and ignore this field. */
  tier: TrainerTier;
  /** Two- or three-line summary shown at top of the event screen. */
  desc: string;
  /** Optional flavor line below the title, italic. */
  flavor?: string;

  entry: number;               // CR cost to enter
  teamSize: number;            // default team size per fight

  // Gates (all must pass to enter)
  requires: {
    storyFlags?: string[];
    minFame?: number;
    /** When set, only available if player is at this tier. */
    requiredTier?: TrainerTier;
    /** Custom rejection text per gate failure. */
    rejectionIfLowFame?: string;
    rejectionIfFlagMissing?: string;
  };

  // Overall completion rewards
  championFameBonus: number;
  championPrizeBonus: number;
  championFlag?: string;         // flag set on full completion
  championTierUpgrade?: TrainerTier;  // for tier_test events — bump to this tier
  championCityUnlock?: string;        // unlock this city on full completion

  // The fight list
  bracket: EventFight[];

  /** If true, each fight is retryable independently (you don't restart from R1 on a loss). */
  retryablePerFight: boolean;
  /** If true, fully-completed events stay re-enterable for fame grinding. */
  reEnterable: boolean;
}
