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
    championSpeakerName: 'Principal Halward',
    championSpeakerTitle: 'Ironhaven Academy',
    championMedal: 'Senior Cup Medal',
    championSpeech: "I knew you had it in you. Every spring this town watches our seniors fight, and every spring most of them go back to the foundry. You won't. You belong out there — in the official circuit, on the inter-faction stage, maybe even the Ultimate Tournament one day. Make your school proud, %PLAYER%. Come back when you're champion of the world. We'll be watching.",
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

  // ============================================================
  // INTER-FACTION TOURNAMENT
  // ============================================================
  // Unlocks once the player has become president of their own faction
  // (flag: 'faction_president'). Fights the other three faction presidents.
  // Winning unlocks the Ultimate Tournament.
  inter_faction: {
    id: 'inter_faction',
    kind: 'tournament',
    tier: 'elite',
    name: 'Inter-Faction Championship',
    hostLocationId: 'holl_officials',  // hosted at Hollowmere officials' hall for now
    desc: 'Three fights against the presidents of the other three factions. Win to claim your faction as the dominant force.',
    flavor: 'The arena floor is sand. The crowds are bigger than any tournament you have seen.',
    entry: 5000,
    teamSize: 3,
    requires: { storyFlags: ['faction_president'] },
    championFameBonus: 500,
    championPrizeBonus: 25000,
    championFlag: 'inter_faction_won',
    bracket: [
      // The actual trainer ids will be filtered at runtime to exclude the player's
      // own faction president. For now we list all three; the screen logic will
      // skip the one belonging to the player's faction.
      { trainerId: 'pres_naturesOwn',    oppLevel: 28, fameOnWin: 80,  prizeOnWin: 4000, xpOnWin: 400, subtitle: "Nature's Own President" },
      { trainerId: 'pres_elementalists', oppLevel: 28, fameOnWin: 100, prizeOnWin: 5000, xpOnWin: 450, subtitle: "Elementalist President" },
      { trainerId: 'pres_industrials',   oppLevel: 28, fameOnWin: 120, prizeOnWin: 6000, xpOnWin: 500, subtitle: 'Industrial President' },
    ],
    retryablePerFight: false,
    reEnterable: false,
  },

  // ============================================================
  // ULTIMATE TOURNAMENT — world champion bracket
  // ============================================================
  // Unlocks after winning the Inter-Faction Championship.
  // Eight escalating fights against the top 8 world fighters.
  ultimate: {
    id: 'ultimate',
    kind: 'tournament',
    tier: 'elite',
    name: 'Ultimate Tournament',
    hostLocationId: 'holl_officials',
    desc: 'The world rank, top to bottom. Eight fights. The final is against the reigning champion.',
    flavor: 'Once a year. Broadcast everywhere. Only one trainer leaves with the title.',
    entry: 10000,
    teamSize: 3,
    requires: { storyFlags: ['inter_faction_won'] },
    championFameBonus: 5000,
    championPrizeBonus: 200000,
    championFlag: 'world_champion',
    bracket: [
      { trainerId: 'ult_1', oppLevel: 28, fameOnWin: 100, prizeOnWin: 3000,  xpOnWin: 400, subtitle: '#8 World Rank' },
      { trainerId: 'ult_2', oppLevel: 29, fameOnWin: 150, prizeOnWin: 4000,  xpOnWin: 420, subtitle: '#7 World Rank' },
      { trainerId: 'ult_3', oppLevel: 29, fameOnWin: 200, prizeOnWin: 5000,  xpOnWin: 440, subtitle: '#6 World Rank' },
      { trainerId: 'ult_4', oppLevel: 30, fameOnWin: 280, prizeOnWin: 6500,  xpOnWin: 460, subtitle: '#5 World Rank' },
      { trainerId: 'ult_5', oppLevel: 30, fameOnWin: 360, prizeOnWin: 8000,  xpOnWin: 480, subtitle: '#4 World Rank' },
      { trainerId: 'ult_6', oppLevel: 30, fameOnWin: 480, prizeOnWin: 10000, xpOnWin: 500, subtitle: '#3 World Rank' },
      { trainerId: 'ult_7', oppLevel: 30, fameOnWin: 640, prizeOnWin: 13000, xpOnWin: 520, subtitle: '#2 World Rank' },
      { trainerId: 'ult_8', oppLevel: 30, fameOnWin: 1000, prizeOnWin: 20000, xpOnWin: 600, subtitle: '#1 World Rank · CHAMPION' },
    ],
    retryablePerFight: false,
    reEnterable: false,
  },
};

export const TOURNAMENT_LIST = Object.values(TOURNAMENTS);
