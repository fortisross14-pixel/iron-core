/**
 * PLAYER TIER — separate from fame.
 *
 * The player starts at 'amateur'. Tier advances only by passing a Test:
 *   Official Test     — 3 fights, opponents ~900-1000 fame
 *   Professional Test — 3 fights, opponents ~3500-5000 fame (TODO)
 *   Elite Test        — 3 fights, opponents ~15000+ fame (TODO)
 *
 * Tier determines:
 *   - Which trainers the player can challenge (same-tier or below; never above)
 *   - Which tournaments are visible
 *   - Which cities/locations unlock
 *
 * Tier and fame are tracked separately. A player can have very high fame
 * without advancing tier (if they grind same-tier opponents but never take
 * the Test).
 */

import type { TrainerTier } from '../data/trainers';

export const TIER_ORDER: TrainerTier[] = ['amateur', 'official', 'professional', 'elite'];

export function tierIndex(tier: TrainerTier): number {
  return TIER_ORDER.indexOf(tier);
}

export function canChallengeTrainer(playerTier: TrainerTier, trainerTier: TrainerTier): boolean {
  return tierIndex(playerTier) >= tierIndex(trainerTier);
}

export function nextTier(tier: TrainerTier): TrainerTier | null {
  const idx = tierIndex(tier);
  if (idx < 0 || idx >= TIER_ORDER.length - 1) return null;
  return TIER_ORDER[idx + 1];
}

export const TIER_LABEL: Record<TrainerTier, string> = {
  amateur: 'AMATEUR',
  official: 'OFFICIAL',
  professional: 'PROFESSIONAL',
  elite: 'ELITE',
};

export const TIER_COLOR: Record<TrainerTier, string> = {
  amateur: '#888',
  official: '#7fb069',
  professional: '#5fa8ff',
  elite: '#ffd700',
};
