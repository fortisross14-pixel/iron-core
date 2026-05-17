import { ATTACKS } from '../data/attacks';
import { ARMORS } from '../data/armors';
import { WEAPONS } from '../data/weapons';
import { MODELS } from '../data/models';
import { getEffectiveness } from '../data/types';
import type { Attack, AttackElement, StatusInflict } from '../data/attacks';
import type { MechaType } from '../data/types';
import { getBotStats, getBotType, getFactionAffinity, maxBatteryOf } from './stats';
import type { FactionId } from '../data/factions';
import type { Bot, FinalStats } from './types';

// ============================================================
// In-combat bot — transient, derived from a Bot
// ============================================================

export type Side = 'player' | 'opp';

export interface ActiveStatus {
  type: StatusInflict['type'];
  duration: number;
  value: number;
}

export interface StatModTimer {
  stat: 'attack' | 'defense' | 'speed';
  value: number;
  dur: number;
}

export interface CombatBot {
  // identity (copied from Bot)
  id: string;
  modelId: string;
  firstName: string;
  level: number;
  maxHp: number;
  /** Maximum battery for this bot (determined by equipped battery cell). */
  maxBattery: number;
  /** Initial battery at fight start, used for "carry over" between tournament rounds. */
  battery: string | null;
  weapon: string | null;
  armor: string | null;
  learnedAttacks: string[];

  side: Side;
  hp: number;
  /** Current battery. Drained by attacks. */
  bat: number;
  baseStats: FinalStats;
  statMods: { attack: number; defense: number; speed: number };
  statuses: ActiveStatus[];
  defending: boolean;
  actedThisRound: boolean;
  signatureUsesLeft: number;
  _modTimers: StatModTimer[];
}

export function makeCombatBot(
  bot: Bot,
  mentorBonuses: { attack: number; defense: number; speed: number },
  side: Side,
  /** Optional override for current HP / battery — used when carrying over from a previous tournament fight. */
  carryover?: { hp?: number; bat?: number },
): CombatBot {
  const maxBattery = maxBatteryOf(bot);
  return {
    id: bot.id,
    modelId: bot.modelId,
    firstName: bot.firstName,
    level: bot.level,
    maxHp: bot.maxHp,
    maxBattery,
    battery: bot.battery,
    weapon: bot.weapon,
    armor: bot.armor,
    learnedAttacks: bot.learnedAttacks,
    side,
    hp: carryover?.hp ?? bot.maxHp,
    bat: carryover?.bat ?? maxBattery,
    baseStats: getBotStats(bot, mentorBonuses),
    statMods: { attack: 0, defense: 0, speed: 0 },
    statuses: [],
    defending: false,
    actedThisRound: false,
    signatureUsesLeft: 2,
    _modTimers: [],
  };
}

/** Current effective stats taking transient mods into account. */
export function getCurrentStats(cb: CombatBot): FinalStats {
  let attack = cb.baseStats.attack * (1 + cb.statMods.attack);
  let defense = cb.baseStats.defense * (1 + cb.statMods.defense);
  let speed = cb.baseStats.speed + cb.statMods.speed;
  let intelligence = cb.baseStats.intelligence;

  for (const st of cb.statuses) {
    if (st.type === 'armor_break') defense *= 1 - st.value;
    if (st.type === 'corrode') defense *= 1 - st.value;
    if (st.type === 'slow') speed -= st.value;
  }
  if (cb.defending) defense *= 1.5;

  return {
    attack: Math.round(attack),
    defense: Math.round(defense),
    speed: Math.round(speed),
    intelligence: Math.round(intelligence),
  };
}

// ============================================================
// Damage formula
// ============================================================

export interface DamageResult {
  hit: boolean;
  dmg?: number;
  isCrit?: boolean;
  typeMult?: number;
  effLabel?: string | null;
  effectiveness?: number;
  /** For support attacks (e.g. Replenish Charge), the type of buff. */
  support?: 'recharge' | 'heal';
  /** The numeric value of the support effect. */
  supportValue?: number;
}

export function calculateDamage(
  attacker: CombatBot,
  defender: CombatBot,
  attack: Attack,
  attackerFactionId: FactionId | null,
): DamageResult {
  const aStats = getCurrentStats(attacker);
  const dStats = getCurrentStats(defender);
  const intDiff = aStats.intelligence - dStats.intelligence;
  const accBonus = Math.max(-15, Math.min(15, intDiff * 0.6));
  const acc = Math.max(40, attack.accuracy + accBonus);
  if (Math.random() * 100 > acc) return { hit: false };

  let effDef = dStats.defense;
  if (attack.ignoresDefense) effDef *= 1 - attack.ignoresDefense;

  // resolve attack type → if physical, fall back to attacker's bot type
  const atkType: MechaType = attack.type !== 'physical' ? attack.type : getBotType({ modelId: attacker.modelId } as Bot);
  const defType: MechaType = getBotType({ modelId: defender.modelId } as Bot);

  let typeMult = getEffectiveness(atkType, defType);

  // armor resistance — only when the attack's resolved type matches the resist
  if (defender.armor) {
    const armor = ARMORS[defender.armor];
    if (armor?.resist === atkType) typeMult *= 0.7;
  }

  // faction affinity (player-side only — opponents aren't shown using a faction yet)
  if (attackerFactionId && attacker.side === 'player') {
    const attackerType = getBotType({ modelId: attacker.modelId } as Bot);
    typeMult *= getFactionAffinity(attackerType, attackerFactionId);
  }

  const base = aStats.attack * (attack.power / 100) * 3.0;
  const mitigation = 1 - Math.min(0.7, effDef / 220);
  const variance = 0.90 + Math.random() * 0.20;
  const critChance = 0.07 + Math.min(0.20, intDiff / 200);
  const isCrit = Math.random() < Math.max(0.03, critChance);
  let dmg = Math.round(base * mitigation * variance * typeMult * (isCrit ? 1.65 : 1));
  dmg = Math.max(1, dmg);

  return {
    hit: true,
    dmg,
    isCrit,
    typeMult,
    effLabel: typeMult >= 1.5 ? 'SUPER EFFECTIVE' : typeMult <= 0.7 ? 'RESISTED' : null,
  };
}

// ============================================================
// Status / item helpers
// ============================================================

export function rollStatusResist(target: CombatBot): number {
  const t = getCurrentStats(target);
  return Math.min(0.40, t.intelligence / 100);
}

export function applyStatusTicks(cb: CombatBot): number {
  let dmgFromStatus = 0;
  const remaining: ActiveStatus[] = [];
  for (const st of cb.statuses) {
    if (st.type === 'burn' || st.type === 'poison') {
      cb.hp -= st.value;
      dmgFromStatus += st.value;
    }
    if (st.duration > 1) remaining.push({ ...st, duration: st.duration - 1 });
  }
  cb.statuses = remaining;
  return dmgFromStatus;
}

export function tickStatMods(cb: CombatBot): void {
  cb._modTimers = cb._modTimers.filter(m => {
    m.dur--;
    if (m.dur <= 0) {
      cb.statMods[m.stat] -= m.value;
      return false;
    }
    return true;
  });
}

export function executeAttack(
  attacker: CombatBot,
  target: CombatBot,
  attack: Attack,
  attackerFactionId: FactionId | null,
): DamageResult {
  // Drain battery (clamped to 0; battery should have been checked before this call)
  attacker.bat = Math.max(0, attacker.bat - attack.batteryCost);

  // SUPPORT ATTACK: Replenish Charge — restore battery to ally, no damage
  if (attack.allyTarget && attack.chargeRestore) {
    target.bat = Math.min(target.maxBattery, target.bat + attack.chargeRestore);
    return { hit: true, dmg: 0, effectiveness: 1, support: 'recharge', supportValue: attack.chargeRestore };
  }

  const r = calculateDamage(attacker, target, attack, attackerFactionId);
  if (!r.hit) return r;
  target.hp -= r.dmg ?? 0;

  if (attack.lifesteal && r.dmg) {
    attacker.hp = Math.min(attacker.maxHp, attacker.hp + Math.round(r.dmg * attack.lifesteal));
  }

  if (attack.statusInflict && Math.random() < attack.statusInflict.chance) {
    if (Math.random() > rollStatusResist(target)) {
      target.statuses.push({
        type: attack.statusInflict.type,
        duration: attack.statusInflict.duration,
        value: attack.statusInflict.value,
      });
    }
  }

  if (attack.speedBonus) {
    attacker.statMods.speed += attack.speedBonus;
    attacker._modTimers.push({ stat: 'speed', value: attack.speedBonus, dur: 2 });
  }

  return r;
}

// ============================================================
// Accessors used by combat UI
// ============================================================

/**
 * Returns the bot's active 3 model attacks.
 *
 * Rule: if `learnedAttacks` is non-empty, it IS the full active set (we treat
 * the move-management flow as authoritative). If empty, fall back to the
 * model's defaultAttacks (initial state for new bots).
 *
 * The bot also gets its weapon's signature attack (handled separately by
 * getSignatureAttack).
 */
export function getActiveAttacks(bot: Pick<Bot, 'modelId' | 'learnedAttacks'>): Attack[] {
  const model = MODELS[bot.modelId];
  if (!model) return [];
  const ids = bot.learnedAttacks && bot.learnedAttacks.length > 0
    ? bot.learnedAttacks
    : model.defaultAttacks;
  return ids.map(id => ATTACKS[id]).filter(Boolean);
}

export function getSignatureAttack(bot: Pick<Bot, 'weapon'>): Attack | null {
  if (!bot.weapon) return null;
  const w = WEAPONS[bot.weapon];
  if (!w?.signature) return null;
  return ATTACKS[w.signature] ?? null;
}

// ============================================================
// AI — used by enemy turn
// ============================================================

export function aiChooseAttack(actor: CombatBot, playerAlive: CombatBot[], roundNumber: number): { attack: Attack; isSignature: boolean } {
  // Signature first (if battery allows)
  if (roundNumber >= 3 && actor.signatureUsesLeft > 0 && actor.weapon) {
    const sig = getSignatureAttack({ weapon: actor.weapon });
    if (sig && actor.bat >= sig.batteryCost && Math.random() < 0.6) {
      return { attack: sig, isSignature: true };
    }
  }
  // Filter to affordable attacks. Skip ally-targeted (no AI logic for it).
  let atks = getActiveAttacks({ modelId: actor.modelId, learnedAttacks: actor.learnedAttacks })
    .filter(a => !a.allyTarget && actor.bat >= a.batteryCost);
  // If nothing affordable, fall back to basic_strike (5 cost — always cheap)
  if (!atks.length) {
    return { attack: ATTACKS.basic_strike, isSignature: false };
  }

  if (playerAlive.length > 0) {
    const target = playerAlive[Math.floor(Math.random() * playerAlive.length)];
    const targetType = getBotType({ modelId: target.modelId } as Bot);
    const eff = atks.filter(a => {
      const t: MechaType = a.type !== 'physical' ? a.type : getBotType({ modelId: actor.modelId } as Bot);
      return getEffectiveness(t, targetType) > 1.0;
    });
    if (eff.length && Math.random() < 0.65) {
      return { attack: eff[Math.floor(Math.random() * eff.length)], isSignature: false };
    }
  }
  if (Math.random() < 0.6) {
    const best = [...atks].sort((a, b) => b.power * b.accuracy - a.power * a.accuracy)[0];
    return { attack: best, isSignature: false };
  }
  return { attack: atks[Math.floor(Math.random() * atks.length)], isSignature: false };
}

export function aiChooseTarget(actor: CombatBot, playerAlive: CombatBot[]): CombatBot | null {
  if (!playerAlive.length) return null;
  const lowest = [...playerAlive].sort((a, b) => a.hp - b.hp)[0];
  if (Math.random() < 0.55) return lowest;
  return playerAlive[Math.floor(Math.random() * playerAlive.length)];
}
