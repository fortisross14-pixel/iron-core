/**
 * FAME calculation — pure functions.
 *
 * Reward formula on defeating a trainer:
 *   firstWin:  max(1, round(opponent.fame * 0.10 + 5))
 *   repeatWin: 1   (anti-grind)
 *
 * Tournament fame: separately, each tournament defines per-fight and per-win
 * fame in its data file. This file only handles per-trainer-defeat fame.
 */

import { ALL_TRAINERS } from '../data/trainers';

export function fameRewardForDefeating(
  trainerId: string,
  alreadyDefeated: boolean,
): number {
  if (alreadyDefeated) return 1;
  const t = ALL_TRAINERS[trainerId];
  if (!t) return 0;
  return Math.max(1, Math.round(t.fame * 0.10 + 5));
}

/**
 * XP awarded for defeating a ranked trainer.
 *
 * Trainer XP is meaningfully higher than wild XP so that real challenges
 * advance your roster much faster than grinding the junkyard.
 *
 * Formula: base level XP × tier multiplier.
 *   wild reference: 35 XP per fight
 *   amateur ~ LV3:  20 * 3 = 60   (1.7x a wild)
 *   official ~ LV10: 20 * 10 + 50 = 250  (7x)
 *   professional ~ LV15: 20 * 15 + 150 = 450  (13x)
 *   elite ~ LV25: 20 * 25 + 400 = 900  (26x)
 *   ultimate ~ LV30: 20 * 30 + 1500 = 2100  (60x)
 */
export function xpRewardForTrainer(trainerId: string): number {
  const t = ALL_TRAINERS[trainerId];
  if (!t) return 60;
  const leadLevel = t.team[0]?.level ?? 1;
  const TIER_BONUS: Record<string, number> = {
    amateur: 0,
    official: 50,
    professional: 150,
    elite: 400,
    ultimate: 1500,
  };
  const bonus = TIER_BONUS[t.tier] ?? 0;
  return Math.max(60, leadLevel * 20 + bonus);
}

/**
 * Get the player's rank position within their tier among all trainers
 * (player + every trainer in that tier).
 *
 * Returns 1-indexed rank, with the player's own rank.
 * If the player has 0 fame, they are tied with all 0-fame entities — we put
 * them at the bottom of their tier.
 */
export function getPlayerRank(playerFame: number, tier: import('../data/trainers').TrainerTier): number {
  const tierList = Object.values(ALL_TRAINERS).filter(t => t.tier === tier);
  // count how many trainers have strictly more fame
  const above = tierList.filter(t => t.fame > playerFame).length;
  return above + 1;
}

/**
 * Returns the trainers in a tier sorted by fame descending, with the player
 * inserted at the right position. Each entry is either:
 *   { kind: 'trainer', trainer }
 *   { kind: 'player', fame }
 */
export type RankEntry =
  | { kind: 'trainer'; trainer: import('../data/trainers').Trainer; rank: number; defeated: boolean }
  | { kind: 'player'; fame: number; rank: number };

export function buildRankings(
  playerFame: number,
  tier: import('../data/trainers').TrainerTier,
  defeatedTrainerIds: Set<string>,
): RankEntry[] {
  const tierList = Object.values(ALL_TRAINERS)
    .filter(t => t.tier === tier)
    .sort((a, b) => b.fame - a.fame);

  const result: RankEntry[] = [];
  let inserted = false;
  let rank = 1;

  for (const t of tierList) {
    if (!inserted && playerFame > t.fame) {
      result.push({ kind: 'player', fame: playerFame, rank });
      inserted = true;
      rank++;
    }
    result.push({
      kind: 'trainer',
      trainer: t,
      rank,
      defeated: defeatedTrainerIds.has(t.id),
    });
    rank++;
  }
  if (!inserted) {
    result.push({ kind: 'player', fame: playerFame, rank });
  }
  return result;
}
