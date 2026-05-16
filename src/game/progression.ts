import type { Bot, CrewMember } from './types';
import { MODELS } from '../data/models';
import { suggestFirstName, OPPONENT_FIRST_NAMES } from '../data/names';

const uid = () => Math.random().toString(36).slice(2, 9);
const rand = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
const pick = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

export function createBot(modelId: string, firstName?: string, level = 1): Bot | null {
  const model = MODELS[modelId];
  if (!model) return null;
  return {
    id: uid(),
    modelId,
    firstName: firstName ?? suggestFirstName(),
    level,
    xp: 0,
    xpToNext: level * 100,
    age: 0,
    maxAge: 10,
    maxHp: model.maxHp,
    weapon: null,
    armor: null,
    learnedAttacks: [],
    statBoosts: { attack: 0, defense: 0, speed: 0 },
    disksUsed: 0,
    rank: 'rookie',
    rankWins: 0,
    wins: 0,
    losses: 0,
  };
}

export interface OpponentParams {
  level: number;
  rankId?: string;
  forceModelId?: string;
  forceFirstName?: string;
  poolFilter?: (modelId: string) => boolean;
}

export function generateOpponent(params: OpponentParams): Bot {
  let modelId = params.forceModelId;
  if (!modelId) {
    const pool = Object.keys(MODELS).filter(id => {
      const m = MODELS[id];
      if (m.rarity === 'starter' || m.rarity === 'legendary') return false;
      if (params.poolFilter) return params.poolFilter(id);
      if (params.level <= 3) return m.rarity === 'common';
      if (params.level <= 7) return m.rarity === 'common' || m.rarity === 'uncommon';
      return m.rarity === 'uncommon' || m.rarity === 'rare';
    });
    modelId = pick(pool.length ? pool : Object.keys(MODELS).filter(id => MODELS[id].rarity === 'common'));
  }
  const firstName = params.forceFirstName ?? pick(OPPONENT_FIRST_NAMES);
  const lvl = Math.max(1, params.level + rand(-1, 1));
  const bot = createBot(modelId, firstName, lvl)!;
  bot.rank = params.rankId ?? 'rookie';
  // light stat boost so opponents feel scaled
  const boost = Math.min(lvl * 2, lvl * 3);
  bot.statBoosts.attack += Math.floor(boost / 3);
  bot.statBoosts.defense += Math.floor(boost / 3);
  bot.statBoosts.speed += Math.floor(boost / 3);
  return bot;
}

/** Generate a wild (abandoned mecha) opponent for the junkyard. */
export function generateJunkyardWild(playerLevel: number): Bot {
  const wildIds = ['rust_husk', 'feral_grub', 'brittle_charge'];
  return generateOpponent({
    level: Math.max(1, playerLevel - 1),
    rankId: 'rookie',
    forceModelId: pick(wildIds),
    forceFirstName: 'Feral',
  });
}

/** Apply XP and handle level-ups. Returns the new bot (immutable). */
export function applyXp(bot: Bot, gainedXp: number): Bot {
  let u = { ...bot, xp: bot.xp + gainedXp };
  while (u.xp >= u.xpToNext) {
    u = {
      ...u,
      xp: u.xp - u.xpToNext,
      level: u.level + 1,
      xpToNext: (u.level + 1) * 100,
      maxHp: u.maxHp + 8,
    };
  }
  return u;
}

/** Convert a fully-aged bot into a Crew member. */
export function retireBot(bot: Bot, retiredAt: number, finalPower: number): CrewMember {
  return {
    ...bot,
    finalPower,
    mentorSkill: 'attack',
    retiredAt,
  };
}
