/**
 * Game-level types used by both state and game logic.
 *
 * The Bot is the persistent player-owned entity. The CombatBot (in combat.ts)
 * is the transient in-battle version.
 */

export type StatTarget = 'attack' | 'defense' | 'speed';

export interface StatBoosts {
  attack: number;
  defense: number;
  speed: number;
}

export interface Bot {
  id: string;
  modelId: string;
  firstName: string;
  level: number;
  xp: number;
  xpToNext: number;
  age: number;
  maxAge: number;
  maxHp: number;
  weapon: string | null;
  armor: string | null;
  learnedAttacks: string[];   // attacks installed via attack disks
  statBoosts: StatBoosts;     // permanent stat boosts from stat disks
  disksUsed: number;
  rank: string;
  rankWins: number;
  wins: number;
  losses: number;
}

export interface CrewMember extends Bot {
  finalPower: number;
  mentorSkill: StatTarget;
  retiredAt: number;
}

export interface FinalStats {
  attack: number;
  defense: number;
  speed: number;
  intelligence: number;
}
