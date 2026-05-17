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
import { getPlace } from '../data/places';
import { getBotPower, calcMentorBonuses, getBotStats } from '../game/stats';
import { getRank } from '../data/ranks';
import { getBotFullName } from '../game/display';
import { MODELS } from '../data/models';

import { TOURNAMENTS } from '../data/tournaments';
import { TIER_TESTS } from '../data/tests';
import { ALL_TRAINERS } from '../data/trainers';
import { fameRewardForDefeating } from '../game/fame';

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
    // Player picks 1-to-teamSize bots; teamSize is the CAP, not exact count.
    if (state.battleSetupTeam.length < 1 || state.battleSetupTeam.length > battle.teamSize) return;

    const playerTeamRaw = state.battleSetupTeam
      .map(id => state.bots.find(b => b.id === id))
      .filter((b): b is Bot => Boolean(b));

    const mentorBonuses = calcMentorBonuses(state.crew);
    const carry = state.activeTournament?.carryOver;
    const player = playerTeamRaw.map(b => makeCombatBot(b, mentorBonuses, 'player', carry?.[b.id]));

    // Look up the trainer to use their explicit team roster (if any).
    const trainer = battle.trainerId ? ALL_TRAINERS[battle.trainerId] : null;

    const opp: CombatBot[] = [];
    // Opponent count defaults to player teamSize for trainer fights, but can
    // be overridden (e.g. wild fights cap player at 2 but opp is always 1).
    const oppCount = battle.oppTeamSize ?? battle.teamSize;
    for (let i = 0; i < oppCount; i++) {
      let oppBot: Bot;
      if (battle.isWild) {
        // Look up the grind place to honor its spawnPool levels.
        const place = battle.sourceId ? getPlace(battle.sourceId) : null;
        const spawnPool = place?.kind === 'grind_place' ? place.spawnPool : null;
        if (spawnPool && spawnPool.length > 0) {
          const pick = spawnPool[Math.floor(Math.random() * spawnPool.length)];
          oppBot = generateJunkyardWild(playerTeamRaw[0]?.level ?? 1, {
            minLevel: pick.minLevel,
            maxLevel: pick.maxLevel,
            pool: [pick.modelId],
          });
        } else {
          oppBot = generateJunkyardWild(playerTeamRaw[0]?.level ?? 1);
        }
      } else if (trainer && trainer.team[i]) {
        // Use the trainer's actual team roster, slot by slot.
        const slot = trainer.team[i];
        oppBot = generateOpponent({
          level: slot.level,
          rankId: battle.oppRank,
          forceModelId: slot.modelId,
          forceFirstName: i === 0 ? trainer.firstName : undefined,
        });
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
    const attack = ATTACKS[cs.selectedAttack];
    if (!attacker || !attack) return;

    // Ally-target attacks (e.g. Replenish Charge): target is a player bot, not enemy
    const isAlly = !!attack.allyTarget;
    const target = isAlly
      ? cs.player.find(b => b.id === targetId)
      : cs.opp.find(b => b.id === targetId);
    if (!target || target.hp <= 0) return;
    if (isAlly && target.id === attacker.id) return;  // cannot self-target

    const next = cloneCombat(cs);
    const att = next.player.find(b => b.id === attacker.id)!;
    const tgt = isAlly
      ? next.player.find(b => b.id === target.id)!
      : next.opp.find(b => b.id === target.id)!;
    const r = executeAttack(att, tgt, attack, state.factionId);

    let msgText: string;
    let emphasis: 'crit' | 'super' | 'resisted' | 'miss' | undefined;
    if (r.support === 'recharge') {
      msgText = `${att.firstName} → ${tgt.firstName}: REPLENISH CHARGE +${r.supportValue} BAT`;
      emphasis = 'super';
    } else if (!r.hit) {
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
    } else if (it.effect.type === 'recharge') {
      // Heavy Battery Kit uses 9999 as a "full" sentinel — cap to maxBattery anyway
      user.bat = Math.min(user.maxBattery, user.bat + it.effect.value);
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

  // ---- self-repair: restore 5% of max HP, free, costs the bot's action ----
  const selfRepair = useCallback((botId: string) => {
    const cs = state.combat;
    if (!cs) return;
    const next = cloneCombat(cs);
    const b = next.player.find(x => x.id === botId);
    if (!b || b.hp <= 0 || b.actedThisRound) return;
    const heal = Math.max(1, Math.round(b.maxHp * 0.05));
    b.hp = Math.min(b.maxHp, b.hp + heal);
    b.actedThisRound = true;
    next.message = { text: `${b.firstName}: SELF-REPAIR +${heal} HP`, emphasis: 'super' };
    dispatch({ type: 'COMBAT_REPLACE', combat: next });
    setTimeout(() => checkRoundEnd(next), 700);
  }, [state.combat, dispatch]);

  // ---- self-charge: restore 5% of max battery, free, costs the bot's action ----
  const selfCharge = useCallback((botId: string) => {
    const cs = state.combat;
    if (!cs) return;
    const next = cloneCombat(cs);
    const b = next.player.find(x => x.id === botId);
    if (!b || b.hp <= 0 || b.actedThisRound) return;
    const recharge = Math.max(1, Math.round(b.maxBattery * 0.05));
    b.bat = Math.min(b.maxBattery, b.bat + recharge);
    b.actedThisRound = true;
    next.message = { text: `${b.firstName}: SELF-CHARGE +${recharge} BAT`, emphasis: 'super' };
    dispatch({ type: 'COMBAT_REPLACE', combat: next });
    setTimeout(() => checkRoundEnd(next), 700);
  }, [state.combat, dispatch]);

  // ---- abandon fight: forfeit. In a tournament, this also clears bracket progress. ----
  const abandon = useCallback(() => {
    const cs = state.combat;
    if (!cs) return;
    // Mark all player bots as defeated and finalize as a loss
    const next = cloneCombat(cs);
    for (const b of next.player) b.hp = 0;
    next.message = { text: 'YOU ABANDONED THE FIGHT', emphasis: 'miss' };
    dispatch({ type: 'COMBAT_REPLACE', combat: next });
    setTimeout(() => finalize(next, false), 800);
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

    // ---- fame calculation ----
    // Encounter happens regardless of win/loss; fame only on win.
    // Direct trainer-source challenges (Ranking-screen taps) give NO fame —
    // fame comes only from structured events (tournaments, story, gym, faction).
    let fameGained = 0;
    let defeatedTrainerId: string | undefined;
    const encounteredTrainerId: string | undefined = battle.trainerId;
    const allowFameFromTrainer = battle.source !== 'trainer';
    if (won) {
      if (battle.trainerId && allowFameFromTrainer) {
        const already = state.defeatedTrainerIds.has(battle.trainerId);
        fameGained += fameRewardForDefeating(battle.trainerId, already);
      }
      // even direct challenges still track defeat
      if (battle.trainerId) {
        defeatedTrainerId = battle.trainerId;
      }
      // tournament/battle-config flat bonus (per fight, plus the per-trainer reward)
      if (battle.fameReward) {
        fameGained += battle.fameReward;
      }
    }

    if (won) {
      if (battle.source === 'junkyard') {
        const drops = Math.random() < 0.85 ? 1 : 0;
        for (let i = 0; i < drops + 1; i++) {
          if (Math.random() < 0.8) {
            const m = MATERIAL_LIST[Math.floor(Math.random() * MATERIAL_LIST.length)];
            materialDrops.push({ id: m.id, count: 1 });
          }
        }
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
      } else if (battle.source === 'trainer') {
        title = 'Trainer Match';
      }
    }

    // detect multi-fight event progress
    const event = battle.eventId
      ? (TOURNAMENTS[battle.eventId] ?? TIER_TESTS[battle.eventId])
      : null;
    const fightIdx = battle.eventFightIndex ?? -1;
    const hasMoreFights = !!event && fightIdx >= 0 && fightIdx < event.bracket.length - 1;
    const isEventMidBracket = won && hasMoreFights;
    const isEventChampion = won && !!event && !hasMoreFights;

    // ---- Tournament REPLAY multiplier (0.5× rounded) ----
    // If this is a tournament (not a tier test) and the championFlag is already
    // set, the player has cleared it before. Apply 0.5× to fame and prize.
    // (Tier tests are not re-enterable, so no multiplier needed.)
    const isReplay = !!event
      && event.kind === 'tournament'
      && !!event.championFlag
      && state.storyFlags.has(event.championFlag);
    if (isReplay && won) {
      fameGained = Math.round(fameGained * 0.5);
      prize = Math.round(prize * 0.5);
    }

    // add champion bonus if we just won the final fight of the event
    let championFlagsToAdd: string[] = [];
    let championCityToUnlock: string | undefined;
    if (isEventChampion && event) {
      // champion bonus also halved on replay
      const champFame = isReplay ? Math.round(event.championFameBonus * 0.5) : event.championFameBonus;
      const champPrize = isReplay ? Math.round(event.championPrizeBonus * 0.5) : event.championPrizeBonus;
      prize += champPrize;
      fameGained += champFame;
      if (event.championFlag) championFlagsToAdd.push(event.championFlag);
      if (event.championCityUnlock) championCityToUnlock = event.championCityUnlock;
    }

    const baseFlags = won ? (battle.onWinFlags ?? []) : (battle.onLossFlags ?? []);
    const allFlags = [...baseFlags, ...championFlagsToAdd];

    // Snapshot player HP+BAT for tournament carry-over (used by APPLY_REWARDS)
    const playerEndState: Record<string, { hp: number; bat: number }> = {};
    for (const b of cs.player) {
      playerEndState[b.id] = { hp: Math.max(0, b.hp), bat: Math.max(0, b.bat) };
    }

    const data: PostFightData = {
      won,
      prize,
      xpReward,
      fameGained,
      defeatedTrainerId,
      encounteredTrainerId,
      // Wild capture trigger (on win, junkyard source, has wildModelId)
      wildModelId: won && battle.source === 'junkyard' && battle.wildModelId
        ? battle.wildModelId : undefined,
      wildLevel: won && battle.source === 'junkyard' && battle.wildModelId
        ? battle.oppLevel : undefined,
      source: battle.source,
      sourceId: battle.sourceId,
      title,
      participants: cs.playerSelectedIds,
      summary: cs.summary,
      lootDrops,
      materialDrops,
      isTournamentMidBracket: isEventMidBracket && event?.retryablePerFight === false,
      playerEndState,
      nextSceneId: won ? battle.onWinSceneId : battle.onLossSceneId,
      flagsToSet: allFlags.length ? allFlags : undefined,
      cityToUnlock: championCityToUnlock ?? (won ? battle.unlockCityId : undefined),
    };

    dispatch({ type: 'POSTFIGHT_SET', data });
  }, [state.pendingBattle, state.defeatedTrainerIds, dispatch]);

  // ---- ack post fight → apply rewards and route ----
  const ackPostFight = useCallback(() => {
    const d = state.postFight;
    if (!d) return;
    const battle = state.pendingBattle;

    // Set flags
    for (const f of d.flagsToSet ?? []) dispatch({ type: 'SET_FLAG', flag: f });
    if (d.cityToUnlock) dispatch({ type: 'UNLOCK_CITY', cityId: d.cityToUnlock });
    if (d.nextSceneId) dispatch({ type: 'OPEN_DIALOG', sceneId: d.nextSceneId });

    // Identify the event if any
    const event = battle?.eventId
      ? (TOURNAMENTS[battle.eventId] ?? TIER_TESTS[battle.eventId])
      : null;
    const fightIdx = battle?.eventFightIndex ?? -1;

    // ON WIN: bump event progress
    if (d.won && event && fightIdx >= 0) {
      dispatch({ type: 'EVENT_PROGRESS', eventId: event.id, fightIndex: fightIdx });
    }

    // ON FULL EVENT COMPLETION (champion): tier upgrade if specified, count the win
    if (d.won && event && fightIdx === event.bracket.length - 1) {
      dispatch({ type: 'CHAMPION_WIN', eventId: event.id });
      if (event.championTierUpgrade) {
        dispatch({ type: 'PROMOTE_TIER', tier: event.championTierUpgrade });
      }
    }

    // Tournament mid-bracket: apply rewards (saves HP/BAT carry-over and
    // bumps tournament progress), queue the next battle, then route to the
    // between-fight screen so the player can use items, see roster status, or
    // abandon. Pressing NEXT FIGHT there calls startBattle() directly.
    if (d.isTournamentMidBracket && event && event.retryablePerFight === false) {
      const nextIdx = fightIdx + 1;
      const next = event.bracket[nextIdx];
      const trainer = next.trainerId ? ALL_TRAINERS[next.trainerId] : null;
      const nextBattle: PendingBattle = {
        source: battle!.source,
        sourceId: event.id,
        oppLevel: next.oppLevel,
        oppRank: 'competitor',
        teamSize: next.teamSize ?? event.teamSize,
        trainerId: next.trainerId,
        forceModelId: trainer?.team[0]?.modelId,
        forceFirstName: trainer?.firstName,
        prize: next.prizeOnWin,
        xpReward: next.xpOnWin,
        fameReward: next.fameOnWin,
        eventId: event.id,
        eventFightIndex: nextIdx,
      };
      dispatch({ type: 'APPLY_REWARDS' });
      dispatch({ type: 'TOURNAMENT_NEXT_ROUND' });
      dispatch({ type: 'QUEUE_BATTLE', battle: nextBattle });
      dispatch({ type: 'SET_BATTLE_TEAM', botIds: d.participants });
      dispatch({ type: 'GO_SCENE', scene: 'tournament_between' });
      return;
    }

    // Otherwise — apply rewards and route back.
    // For retryable events (tier tests), return to the location screen so
    // the player sees their updated event progress and can pick the next fight.
    dispatch({ type: 'APPLY_REWARDS' });
    dispatch({ type: 'GO_SCENE', scene: 'location' });
  }, [state.postFight, state.pendingBattle, state.bots, state.crew, dispatch]);

  return { startBattle, pickTarget, pickItem, defend, selfRepair, selfCharge, abandon, ackPostFight };
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
