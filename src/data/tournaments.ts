/**
 * TOURNAMENTS — multi-fight events of kind 'tournament'.
 *
 * Re-enterable. Lose on any fight → tournament ends; you keep fame and prize
 * from cleared rounds, but you'll need to start from R1 next time.
 *
 * (Tier tests are in tests.ts. Both use the same MultiFightEvent shape and
 * the same MultiFightEventView component.)
 */

import type { MultiFightEvent } from './multifight';

export const TOURNAMENTS: Record<string, MultiFightEvent> = {
  senior_cup: {
    id: 'senior_cup',
    kind: 'tournament',
    tier: 'amateur',
    name: 'Senior Cup',
    hostLocationId: 'iron_academy',
    desc: 'High school graduation tournament. Two rounds, escalating difficulty.',
    flavor: 'Held in the academy yard every spring.',
    entry: 0,
    teamSize: 1,
    requires: { storyFlags: ['academy_first_seen'] },
    championFameBonus: 5,
    championPrizeBonus: 150,
    championFlag: 'senior_cup_won',
    bracket: [
      { trainerId: 'am_001', oppLevel: 1, fameOnWin: 1, prizeOnWin: 75,  xpOnWin: 60, subtitle: 'A nervous classmate' },
      { trainerId: 'am_005', oppLevel: 3, fameOnWin: 1, prizeOnWin: 125, xpOnWin: 90, subtitle: 'Last year\'s runner-up' },
    ],
    retryablePerFight: false,
    reEnterable: true,
  },
  voltspire_bronze: {
    id: 'voltspire_bronze',
    kind: 'tournament',
    tier: 'amateur',
    name: 'Voltspire Bronze',
    hostLocationId: 'volt_tournament',
    desc: "Three rounds. The official circuit's entry event.",
    flavor: 'Storm-pylons hum over the arena.',
    entry: 200,
    teamSize: 2,
    requires: { storyFlags: ['krait_rematch_won'] },
    championFameBonus: 15,
    championPrizeBonus: 600,
    championFlag: 'voltspire_bronze_won',
    bracket: [
      { trainerId: 'am_006', oppLevel: 4, fameOnWin: 2, prizeOnWin: 200, xpOnWin: 100, subtitle: 'Junkyard regular' },
      { trainerId: 'am_013', oppLevel: 5, fameOnWin: 3, prizeOnWin: 300, xpOnWin: 120, subtitle: 'Convergence specialist' },
      { trainerId: 'am_020', oppLevel: 6, fameOnWin: 4, prizeOnWin: 400, xpOnWin: 140, subtitle: 'Defending Bronze champion' },
    ],
    retryablePerFight: false,
    reEnterable: true,
  },
  voltspire_apex: {
    id: 'voltspire_apex',
    kind: 'tournament',
    tier: 'amateur',
    name: 'Voltspire Apex Cup',
    hostLocationId: 'volt_tournament',
    desc: 'Regional amateur championship. The top three amateurs in the region. Win this and the Officials\' Hall will recognize you.',
    flavor: 'Standing-room only. The crowd is here to see Halloran.',
    entry: 500,
    teamSize: 2,
    requires: { storyFlags: ['voltspire_bronze_won'] },
    championFameBonus: 50,
    championPrizeBonus: 1500,
    championFlag: 'halloran_defeated',
    championCityUnlock: 'hollowmere',
    bracket: [
      { trainerId: 'am_028', oppLevel: 7,  fameOnWin: 8,  prizeOnWin: 500,  xpOnWin: 180, subtitle: '#3 Amateur · 620 fame' },
      { trainerId: 'am_029', oppLevel: 8,  fameOnWin: 12, prizeOnWin: 700,  xpOnWin: 220, subtitle: '#2 Amateur · 720 fame' },
      { trainerId: 'am_030', oppLevel: 9,  fameOnWin: 20, prizeOnWin: 1000, xpOnWin: 280, subtitle: '#1 Amateur · 820 fame' },
    ],
    retryablePerFight: false,
    reEnterable: true,
  },
  // ===== VISIBLE-BUT-LOCKED higher-tier tournaments (preview) =====
  voltspire_silver: {
    id: 'voltspire_silver',
    kind: 'tournament',
    tier: 'official',
    name: 'Voltspire Silver',
    hostLocationId: 'volt_tournament',
    desc: 'Official-tier circuit event. Three rounds, sanctioned opponents.',
    flavor: 'For Officials only. Don\'t come here without your registry pin.',
    entry: 1000,
    teamSize: 2,
    requires: { storyFlags: ['official_test_passed'] },
    championFameBonus: 60,
    championPrizeBonus: 3000,
    championFlag: 'voltspire_silver_won',
    bracket: [
      { oppLevel: 14, fameOnWin: 12, prizeOnWin: 800,  xpOnWin: 250, subtitle: 'Official challenger I' },
      { oppLevel: 15, fameOnWin: 15, prizeOnWin: 1000, xpOnWin: 280, subtitle: 'Official challenger II' },
      { oppLevel: 16, fameOnWin: 18, prizeOnWin: 1200, xpOnWin: 300, subtitle: 'Silver defending champion' },
    ],
    retryablePerFight: false,
    reEnterable: true,
  },
};

export const TOURNAMENT_LIST = Object.values(TOURNAMENTS);
