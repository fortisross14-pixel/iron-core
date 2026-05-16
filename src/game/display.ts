import { MODELS } from '../data/models';
import type { Bot } from './types';

export function getBotFullName(bot: Bot): string {
  const m = MODELS[bot.modelId];
  if (!m) return bot.firstName;
  return `${bot.firstName} ${m.surname}`;
}

export function getBotShortName(bot: Bot): string {
  return bot.firstName;
}
