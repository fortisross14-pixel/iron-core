/**
 * Tournaments. Registered at tournament_hall locations.
 *
 * Each tournament is gated by required story flags or location visits.
 */

export interface Tournament {
  id: string;
  name: string;
  hostLocationId: string;        // where you sign up
  desc: string;
  rounds: number;
  entry: number;
  prize: number;
  xpReward: number;
  teamSize: number;
  oppLevel: number;
  oppRank: string;
  ageTick: number;
  requires: {
    storyFlags?: string[];
  };
  modelReward?: string;
}

export const TOURNAMENTS: Record<string, Tournament> = {
  senior_cup: {
    id: 'senior_cup',
    name: 'Senior Cup',
    hostLocationId: 'iron_academy',
    desc: 'High school graduation tournament. One bout. Small prize.',
    rounds: 1, entry: 0, prize: 200, xpReward: 80,
    teamSize: 1, oppLevel: 2, oppRank: 'rookie', ageTick: 0.1,
    requires: { storyFlags: ['academy_first_seen'] },
  },
  voltspire_bronze: {
    id: 'voltspire_bronze',
    name: 'Voltspire Bronze',
    hostLocationId: 'volt_tournament',
    desc: 'Three rounds. The official circuit\'s entry event.',
    rounds: 3, entry: 200, prize: 1500, xpReward: 200,
    teamSize: 2, oppLevel: 4, oppRank: 'competitor', ageTick: 0.5,
    requires: { storyFlags: ['krait_rematch_won'] },
  },
};

export const TOURNAMENT_LIST = Object.values(TOURNAMENTS);
