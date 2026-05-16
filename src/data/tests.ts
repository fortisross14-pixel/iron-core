/**
 * TIER TESTS — multi-fight events of kind 'tier_test'.
 *
 * Each Test promotes the player to the next tier on full completion.
 * Per-fight retryable. Lose a fight → just retry that one fight.
 * Once passed, the test is NOT re-enterable (you can't downgrade).
 *
 * Gates: defeated the prior tier's champion + reached the fame threshold.
 *
 * --------
 * EDITING:
 *   - To change examiner names: edit /data/trainers.ts (TRAINERS_OFFICIAL section).
 *   - To change fight order, levels, or rewards: edit the bracket below.
 *   - To change the rejection messages: edit `rejectionIfLowFame` / `rejectionIfFlagMissing`.
 *   - To add a new test (Professional, Elite): add a new entry below.
 */

import type { MultiFightEvent } from './multifight';

export const TIER_TESTS: Record<string, MultiFightEvent> = {
  official_test: {
    id: 'official_test',
    kind: 'tier_test',
    tier: 'official',
    name: 'Official Test',
    hostLocationId: 'holl_officials',
    desc: 'Three sanctioned bouts against Official Examiners. Pass all three to be registered as an Official trainer.',
    flavor: 'Held year-round at the Officials\' Hall in Hollowmere.',
    entry: 0,
    teamSize: 1,
    requires: {
      storyFlags: ['halloran_defeated'],
      // NOTE: gate is intentionally low for now. Once trainer-challenge UI ships
      // (Step 3), there will be a fame-grind path between Bronze and Apex; this
      // gate should rise to ~700 then.
      minFame: 100,
      rejectionIfFlagMissing: 'The receptionist looks you up and down. "We don\'t know your name yet. Come back when you do."',
      rejectionIfLowFame: 'The receptionist checks her ledger. "Need at least a hundred fame to even sit the exam. Come back."',
    },
    championFameBonus: 0,           // each fight already grants +100; no extra champion bonus
    championPrizeBonus: 2000,
    championFlag: 'official_test_passed',
    championTierUpgrade: 'official',
    bracket: [
      {
        trainerId: 'ex_forge',
        oppLevel: 12,
        fameOnWin: 100,
        prizeOnWin: 500,
        xpOnWin: 200,
        subtitle: 'Examiner I · Fire/Steel · 900 fame',
      },
      {
        trainerId: 'ex_tide',
        oppLevel: 12,
        fameOnWin: 100,
        prizeOnWin: 500,
        xpOnWin: 200,
        subtitle: 'Examiner II · Water/Bio · 950 fame',
      },
      {
        trainerId: 'ex_storm',
        oppLevel: 13,
        fameOnWin: 100,
        prizeOnWin: 500,
        xpOnWin: 200,
        subtitle: 'Examiner III · Lightning/Ice · 1000 fame',
      },
    ],
    retryablePerFight: true,
    reEnterable: false,
  },
};

export const TIER_TEST_LIST = Object.values(TIER_TESTS);
