import { MODELS } from '../data/models';
import { WEAPONS } from '../data/weapons';
import { ARMORS } from '../data/armors';
import { FACTIONS } from '../data/factions';
import type { FactionId } from '../data/factions';
import type { MechaType } from '../data/types';
import type { Bot, CrewMember, FinalStats, StatTarget } from './types';

/** Disk capacity scales with level. */
export const getDiskCapacity = (bot: Bot): number => bot.level * 3;

/** Look up the mecha type for a bot. */
export const getBotType = (bot: Bot): MechaType => {
  return MODELS[bot.modelId]?.type ?? 'steel';
};

/** Compute total stat bonus from crew mentors.
 *  Each crew member contributes a % bonus to the player's best stat at the time
 *  of retirement: `bonus% = level * 0.5`. Multiple crew bots stack additively. */
export function calcMentorBonuses(crew: CrewMember[]): { attack: number; defense: number; speed: number } {
  const b = { attack: 0, defense: 0, speed: 0 };
  for (const r of crew) {
    const contribution = r.level * 0.5;     // % bonus
    if (r.mentorSkill in b) {
      b[r.mentorSkill] += contribution;
    }
  }
  return {
    attack:  Math.round(b.attack * 10) / 10,
    defense: Math.round(b.defense * 10) / 10,
    speed:   Math.round(b.speed * 10) / 10,
  };
}

/** Determine which stat a bot is best at — used when it joins crew. */
export function bestStatOf(bot: Pick<Bot, 'modelId' | 'statBoosts'>): StatTarget {
  const m = MODELS[bot.modelId];
  if (!m) return 'attack';
  const a = m.baseStats.attack + bot.statBoosts.attack;
  const d = m.baseStats.defense + bot.statBoosts.defense;
  const s = m.baseStats.speed + bot.statBoosts.speed;
  if (a >= d && a >= s) return 'attack';
  if (d >= s) return 'defense';
  return 'speed';
}

/** Calculate a bot's effective stats including all bonuses. */
export function getBotStats(
  bot: Bot,
  mentorBonuses: { attack: number; defense: number; speed: number } = { attack: 0, defense: 0, speed: 0 }
): FinalStats {
  const model = MODELS[bot.modelId];
  if (!model) return { attack: 0, defense: 0, speed: 0, intelligence: 0 };

  const levelMult = 1 + (bot.level - 1) * 0.08;
  let attack = model.baseStats.attack * levelMult;
  let defense = model.baseStats.defense * levelMult;
  let speed = model.baseStats.speed * levelMult;
  let intelligence = model.baseStats.intelligence + (bot.level - 1) * 2.0;

  // equipment
  if (bot.weapon && WEAPONS[bot.weapon]) attack += WEAPONS[bot.weapon].atkBonus;
  if (bot.armor && ARMORS[bot.armor]) defense += ARMORS[bot.armor].defBonus;

  // disk stat boosts
  attack += bot.statBoosts.attack;
  defense += bot.statBoosts.defense;
  speed += bot.statBoosts.speed;

  // mentor bonuses (% based)
  attack *= 1 + mentorBonuses.attack / 100;
  defense *= 1 + mentorBonuses.defense / 100;
  speed *= 1 + mentorBonuses.speed / 100;

  return {
    attack: Math.round(attack),
    defense: Math.round(defense),
    speed: Math.round(speed),
    intelligence: Math.round(intelligence),
  };
}

/** Overall "power" rating used for UI sorting / display. */
export function getBotPower(bot: Bot, mentorBonuses?: { attack: number; defense: number; speed: number }): number {
  const s = getBotStats(bot, mentorBonuses);
  return Math.round((s.attack + s.defense + s.speed + s.intelligence) / 4 + bot.level * 2);
}

/** Faction affinity multiplier — returns 1.0 if no affinity or no faction. */
export function getFactionAffinity(botType: MechaType, factionId: FactionId | null): number {
  if (!factionId) return 1.0;
  const f = FACTIONS[factionId];
  if (!f) return 1.0;
  return f.preferredTypes.includes(botType) ? f.affinityBonus : 1.0;
}
