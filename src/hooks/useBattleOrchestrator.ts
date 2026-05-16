import { useCallback } from 'react';
import { useGame } from '../state/GameStore';
import {
  makeCombatBot, getCurrentStats, executeAttack, applyStatusTicks,
  tickStatMods, aiChooseAttack, aiChooseTarget, getSignatureAttack,
  CombatBot,
} from '../game/combat';
import { ATTACKS } from '../data/attacks';
import { ITEMS } from '../data/items';
import { MATERIALS, MATERIAL_LIST } from '../data/materials';
import { WEAPONS } from '../data/weapons';
import { DISKS } from '../data/disks';
import type { Bot } from '../game/types';
import type { PendingBattle, CombatRuntime, PostFightData, LootDrop } from '../state/types';
import { generateOpponent, generateJunkyardWild, applyXp } from '../game/progression';
import { getBotPower, calcMentorBonuses, getBotStats } from '../game/stats';
import { getRank } from '../data/ranks';
import { getBotFullName } from '../game/display';
import { MODELS } from '../data/models';

/**
 * useBattleOrchestrator: high-level commands for combat flow.
 *
 * The reducer is pure; this hook chains dispatches that involve game logic
 * computations or setTimeouts (enemy turn animations, etc).
 */
export function useBattleOrchestrator() {
  const { state, dispatch } = useGame();

  // ---- enter battle from a queued PendingBattle + a selected team ----
  const startBattle = useCallback(() => {
    if (!state.pendingBattle) return;
    const battle = state.pendingBattle;
    if (state.battleSetupTeam.length !== battle.teamSize) return;

    const playerTeamRaw = state.battleSetupTeam
      .map(id => state.bots.find(b => b.id === id))
      .filter((b): b is Bot => Boolean(b));

    const mentorBonuses = calcMentorBonuses(state.crew);
    const player = playerTeamRaw.map(b => makeCombatBot(b, mentorBonuses, 'player'));

    const opp: CombatBot[] = [];
    for (let i = 0; i < battle.teamSize; i++) {
      let oppBot: Bot;
      if (battle.isWild) {
        oppBot = generateJunkyardWild(playerTeamRaw[0]?.level ?? 1);
      } else if (i === 0 && battle.forceModelId) {
        oppBot = generateOpponent({
          level: battle.oppLevel,
          rankId: battle.oppRank,
          forceModelId: battle.forceModelId,
          forceFirstName: battle.forceFirstName,
        });
      } else {
        oppBot = generateOpponent({ level: battle.oppLevel, rankId: battle.oppRank });
      }
      opp.push(makeCombatBot(oppBot, { attack: 0, defense: 0, speed: 0 }, 'opp'));
    }

    const combat: CombatRuntime = {
      player,
      opp,
      battleRound: 1,
      phase: 'player_select',
      action: null,
      selectedBot: null,
      selectedAttack: null,
      isSignature: false,
      selectedItem: null,
      message: null,
      summary: { dmgDealt: 0, dmgTaken: 0, hits: 0, crits: 0, sigsUsed: 0, statusDamage: 0 },
      playerSelectedIds: state.battleSetupTeam,
      tournamentRound: battle.tournamentRound,
      maxTournamentRound: battle.maxTournamentRound,
      source: battle.source,
      sourceId: battle.sourceId,
    };

    dispatch({ type: 'COMBAT_SET', combat });
  }, [state.pendingBattle, state.battleSetupTeam, state.bots, state.crew, dispatch]);

  // ---- pick target (resolves player's attack) ----
  const pickTarget = useCallback((targetId: string) => {
    const cs = state.combat;
    if (!cs || !cs.selectedBot || !cs.selectedAttack) return;
    const attacker = cs.player.find(b => b.id === cs.selectedBot);
    const target = cs.opp.find(b => b.id === targetId);
    if (!attacker || !target || target.hp <= 0) return;
    const attack = ATTACKS[cs.selectedAttack];
    if (!attack) return;

    const next = cloneCombat(cs);
    const att = next.player.find(b => b.id === attacker.id)!;
    const tgt = next.opp.find(b => b.id === target.id)!;
    const r = executeAttack(att, tgt, attack, state.factionId);

    let msgText: string;
    let emphasis: 'crit' | 'super' | 'resisted' | 'miss' | undefined;
    if (!r.hit) {
      msgText = `${att.firstName} → ${tgt.firstName}: MISSED`;
      emphasis = 'miss';
    } else {
      msgText = `${att.firstName} → ${tgt.firstName}: ${attack.name} hits for ${r.dmg}`;
      if (r.isCrit) { msgText += ' · CRIT'; emphasis = 'crit'; }
      else if (r.effLabel === 'SUPER EFFECTIVE') { msgText += ' · SUPER'; emphasis = 'super'; }
      else if (r.effLabel === 'RESISTED') { msgText += ' · RESISTED'; emphasis = 'resisted'; }
      next.summary.dmgDealt += r.dmg ?? 0;
      next.summary.hits += 1;
      if (r.isCrit) next.summary.crits += 1;
    }

    if (cs.isSignature) {
      att.signatureUsesLeft -= 1;
      next.summary.sigsUsed += 1;
    }

    att.actedThisRound = true;
    next.message = { text: msgText, emphasis };
    dispatch({ type: 'COMBAT_REPLACE', combat: next });

    // schedule a check after the message displays
    setTimeout(() => checkRoundEnd(next), 900);
  }, [state.combat, state.factionId, dispatch]);

  // ---- pick item ----
  const pickItem = useCallback((itemId: string) => {
    const cs = state.combat;
    if (!cs || !cs.selectedBot) return;
    if (!state.items[itemId] || state.items[itemId] <= 0) {
      dispatch({ type: 'TOAST', message: 'Out of stock.' });
      return;
    }
    const next = cloneCombat(cs);
    const user = next.player.find(b => b.id === cs.selectedBot);
    if (!user) return;
    const it = ITEMS[itemId];
    if (!it) return;
    // apply effect
    if (it.effect.type === 'heal') {
      const amt = Math.round(user.maxHp * it.effect.value);
      user.hp = Math.min(user.maxHp, user.hp + amt);
    } else if (it.effect.type === 'shield') {
      user.statMods.defense += it.effect.value;
      user._modTimers.push({ stat: 'defense', value: it.effect.value, dur: it.effect.dur ?? 3 });
    } else if (it.effect.type === 'buff_atk') {
      user.statMods.attack += it.effect.value;
      user._modTimers.push({ stat: 'attack', value: it.effect.value, dur: it.effect.dur ?? 3 });
    }
    user.actedThisRound = true;
    next.message = { text: `${user.firstName} used ${it.name}` };
    dispatch({ type: 'COMBAT_REPLACE', combat: next });
    dispatch({ type: 'CONSUME_ITEM', itemId });
    setTimeout(() => checkRoundEnd(next), 900);
  }, [state.combat, state.items, dispatch]);

  // ---- defend ----
  const defend = useCallback((botId: string) => {
    const cs = state.combat;
    if (!cs) return;
    const next = cloneCombat(cs);
    const b = next.player.find(x => x.id === botId);
    if (!b || b.hp <= 0 || b.actedThisRound) return;
    b.defending = true;
    b.actedThisRound = true;
    next.message = { text: `${b.firstName} braces` };
    dispatch({ type: 'COMBAT_REPLACE', combat: next });
    setTimeout(() => checkRoundEnd(next), 700);
  }, [state.combat, dispatch]);

  // ---- after every action, check if round ends, enemies act, win/loss --
  const checkRoundEnd = useCallback((cs: CombatRuntime) => {
    if (cs.opp.every(b => b.hp <= 0)) { finalize(cs, true); return; }
    if (cs.player.every(b => b.hp <= 0)) { finalize(cs, false); return; }

    const needsAction = cs.player.some(b => b.hp > 0 && !b.actedThisRound);
    if (needsAction) {
      const next = { ...cs, phase: 'player_select' as const, action: null, selectedBot: null, selectedAttack: null, message: cs.message };
      dispatch({ type: 'COMBAT_REPLACE', combat: next });
      return;
    }
    // enemy turn
    const enemyPhase = { ...cs, phase: 'enemy_turn' as const };
    dispatch({ type: 'COMBAT_REPLACE', combat: enemyPhase });
    setTimeout(() => runEnemyTurn(enemyPhase), 600);
  }, [dispatch]);

  // ---- enemy turn runs all opp actions sequentially, each with a message ----
  const runEnemyTurn = useCallback((csIn: CombatRuntime) => {
    let cs = cloneCombat(csIn);
    const oppAlive = cs.opp
      .filter(b => b.hp > 0)
      .sort((a, b) => getCurrentStats(b).speed - getCurrentStats(a).speed);

    let i = 0;
    const tickOne = () => {
      if (cs.player.every(b => b.hp <= 0)) { finalize(cs, false); return; }
      if (i >= oppAlive.length) {
        endOfRound(cs);
        return;
      }
      const actor = cs.opp.find(b => b.id === oppAlive[i].id);
      i++;
      if (!actor || actor.hp <= 0) { tickOne(); return; }
      const stunned = actor.statuses.find(s => s.type === 'stun');
      if (stunned) {
        cs.message = { text: `${actor.firstName} is stunned`, emphasis: 'status' };
        dispatch({ type: 'COMBAT_REPLACE', combat: { ...cs } });
        setTimeout(tickOne, 700);
        return;
      }
      const playerAlive = cs.player.filter(b => b.hp > 0);
      if (!playerAlive.length) { finalize(cs, false); return; }
      const { attack, isSignature } = aiChooseAttack(actor, playerAlive, cs.battleRound);
      const tgt = aiChooseTarget(actor, playerAlive);
      if (!tgt) { tickOne(); return; }
      const target = cs.player.find(b => b.id === tgt.id);
      if (!target) { tickOne(); return; }
      const r = executeAttack(actor, target, attack, null);
      let msg: string;
      let emphasis: 'crit' | 'super' | 'resisted' | 'miss' | undefined;
      if (!r.hit) {
        msg = `${actor.firstName} → ${target.firstName}: MISSED`;
        emphasis = 'miss';
      } else {
        msg = `${actor.firstName} → ${target.firstName}: ${attack.name} hits for ${r.dmg}`;
        if (r.isCrit) { msg += ' · CRIT'; emphasis = 'crit'; }
        else if (r.effLabel === 'SUPER EFFECTIVE') { msg += ' · SUPER'; emphasis = 'super'; }
        else if (r.effLabel === 'RESISTED') { msg += ' · RESISTED'; emphasis = 'resisted'; }
        cs.summary.dmgTaken += r.dmg ?? 0;
      }
      if (isSignature) actor.signatureUsesLeft -= 1;
      cs.message = { text: msg, emphasis };
      dispatch({ type: 'COMBAT_REPLACE', combat: { ...cs } });
      setTimeout(tickOne, 900);
    };
    tickOne();
  }, [dispatch]);

  // ---- end-of-round: status ticks, reset acted flags, increment round ----
  const endOfRound = useCallback((csIn: CombatRuntime) => {
    let cs = cloneCombat(csIn);
    for (const b of [...cs.player, ...cs.opp]) {
      if (b.hp > 0) {
        const sd = applyStatusTicks(b);
        cs.summary.statusDamage += sd;
        tickStatMods(b);
        b.defending = false;
        b.actedThisRound = false;
      }
    }
    if (cs.opp.every(b => b.hp <= 0)) { finalize(cs, true); return; }
    if (cs.player.every(b => b.hp <= 0)) { finalize(cs, false); return; }
    cs.battleRound += 1;
    cs.phase = 'player_select';
    cs.action = null;
    cs.message = { text: `— Round ${cs.battleRound} —` };
    dispatch({ type: 'COMBAT_REPLACE', combat: cs });
  }, [dispatch]);

  // ---- battle finalization → post fight data ----
  const finalize = useCallback((cs: CombatRuntime, won: boolean) => {
    const battle = state.pendingBattle;
    if (!battle) return;

    let prize = won ? battle.prize : 0;
    let xpReward = won ? battle.xpReward : Math.floor(battle.xpReward * 0.25);
    let title = battle.sourceId;

    const lootDrops: LootDrop[] = [];
    const materialDrops: { id: string; count: number }[] = [];

    if (won) {
      if (battle.source === 'junkyard') {
        // wild bots drop materials
        const drops = Math.random() < 0.85 ? 1 : 0;
        for (let i = 0; i < drops + 1; i++) {
          if (Math.random() < 0.8) {
            const m = MATERIAL_LIST[Math.floor(Math.random() * MATERIAL_LIST.length)];
            materialDrops.push({ id: m.id, count: 1 });
          }
        }
        // tiny chance of a basic disk drop
        if (Math.random() < 0.10) {
          lootDrops.push({ kind: 'disk', id: 'stat_atk_1' });
        }
        title = 'Junkyard';
      } else if (battle.source === 'story') {
        title = 'Story Battle';
      } else if (battle.source === 'tournament') {
        title = 'Tournament';
        if (Math.random() < 0.6) {
          const wList = Object.values(WEAPONS).filter(w => w.price <= prize / 2);
          if (wList.length) lootDrops.push({ kind: 'weapon', id: wList[Math.floor(Math.random() * wList.length)].id });
        }
      }
    }

    const data: PostFightData = {
      won,
      prize,
      xpReward,
      source: battle.source,
      sourceId: battle.sourceId,
      title,
      participants: cs.playerSelectedIds,
      summary: cs.summary,
      lootDrops,
      materialDrops,
      nextSceneId: won ? battle.onWinSceneId : battle.onLossSceneId,
      flagsToSet: won ? battle.onWinFlags : battle.onLossFlags,
      cityToUnlock: won ? battle.unlockCityId : undefined,
    };

    dispatch({ type: 'POSTFIGHT_SET', data });
  }, [state.pendingBattle, dispatch]);

  // ---- ack post fight → apply rewards and run any story scene ----
  const ackPostFight = useCallback(() => {
    const d = state.postFight;
    if (!d) return;
    // we apply rewards by dispatching a series of small actions; this keeps
    // them debuggable in dev tools and lets the reducer stay simple.
    // (we add CONSUME_ITEM/GIVE_MATERIAL via separate actions to keep this clean —
    // not needed yet, we handle these via dispatch chain in the next step)
    // For now we directly compose a single REWARDS_APPLY action below in actions+reducer.

    // Set flags
    for (const f of d.flagsToSet ?? []) dispatch({ type: 'SET_FLAG', flag: f });
    // Unlock city
    if (d.cityToUnlock) dispatch({ type: 'UNLOCK_CITY', cityId: d.cityToUnlock });
    // Open next scene
    if (d.nextSceneId) dispatch({ type: 'OPEN_DIALOG', sceneId: d.nextSceneId });

    // Apply XP / money / loot / materials
    dispatch({ type: 'APPLY_REWARDS' });

    // route back to location
    dispatch({ type: 'GO_SCENE', scene: 'location' });
  }, [state.postFight, dispatch]);

  return { startBattle, pickTarget, pickItem, defend, ackPostFight };
}

function cloneCombat(cs: CombatRuntime): CombatRuntime {
  return {
    ...cs,
    player: cs.player.map(b => ({ ...b, statuses: [...b.statuses], statMods: { ...b.statMods }, _modTimers: [...b._modTimers] })),
    opp: cs.opp.map(b => ({ ...b, statuses: [...b.statuses], statMods: { ...b.statMods }, _modTimers: [...b._modTimers] })),
    summary: { ...cs.summary },
    message: cs.message ? { ...cs.message } : null,
  };
}
