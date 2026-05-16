import type { Action } from './actions';
import type { GameState } from './types';
import { initialState } from './initialState';
import { createBot } from '../game/progression';
import { WEAPONS } from '../data/weapons';
import { ARMORS } from '../data/armors';
import { DISKS } from '../data/disks';
import { ITEMS } from '../data/items';
import { MATERIALS } from '../data/materials';
import { MODELS } from '../data/models';
import { STORY_SCENES } from '../data/story';
import { LOCATIONS } from '../data/locations';
import { getDiskCapacity, getBotType } from '../game/stats';

/**
 * Reducer is pure. Side effects (timers, async combat ticks) are orchestrated
 * by the GameStore wrapper via effects after dispatch.
 */
export function reducer(state: GameState, action: Action): GameState {
  switch (action.type) {

    case 'GO_SCENE':
      return { ...state, scene: action.scene };

    case 'TOAST':
      return { ...state, toast: action.message, toastId: state.toastId + 1 };

    case 'TOAST_CLEAR':
      return { ...state, toast: null };

    // -------- naming / starter --------
    case 'PICK_STARTER_MODEL':
      return {
        ...state,
        pendingNamingModelId: action.modelId,
        pendingNamingIsStarter: true,
        scene: 'naming',
      };

    case 'CONFIRM_NAMING': {
      if (!state.pendingNamingModelId) return state;
      const bot = createBot(state.pendingNamingModelId, action.firstName, 1);
      if (!bot) return state;
      const discovered = new Set(state.discovered);
      discovered.add(bot.modelId);
      return {
        ...state,
        bots: [...state.bots, bot],
        discovered,
        pendingNamingModelId: null,
        pendingNamingIsStarter: false,
        scene: state.pendingNamingIsStarter ? 'town' : state.scene,
      };
    }

    // -------- faction --------
    case 'PICK_FACTION':
      return { ...state, factionId: action.factionId };

    // -------- city / location --------
    case 'ENTER_LOCATION':
      return { ...state, currentLocationId: action.locationId, scene: 'location' };

    case 'LEAVE_LOCATION':
      return { ...state, currentLocationId: null, scene: 'town' };

    case 'SWITCH_CITY':
      return { ...state, currentCityId: action.cityId, currentLocationId: null, scene: 'town' };

    case 'UNLOCK_CITY': {
      const next = new Set(state.unlockedCities);
      next.add(action.cityId);
      return { ...state, unlockedCities: next };
    }

    // -------- story / dialog --------
    case 'OPEN_DIALOG':
      return {
        ...state,
        dialogStack: [...state.dialogStack, { sceneId: action.sceneId, lineIndex: 0 }],
      };

    case 'DIALOG_ADVANCE': {
      if (state.dialogStack.length === 0) return state;
      const top = state.dialogStack[state.dialogStack.length - 1];
      const scene = STORY_SCENES[top.sceneId];
      if (!scene) return { ...state, dialogStack: state.dialogStack.slice(0, -1) };
      if (top.lineIndex + 1 < scene.lines.length) {
        const next = [...state.dialogStack];
        next[next.length - 1] = { ...top, lineIndex: top.lineIndex + 1 };
        return { ...state, dialogStack: next };
      }
      // end of lines — pop and apply effects
      let s: GameState = { ...state, dialogStack: state.dialogStack.slice(0, -1) };
      for (const effect of scene.effects ?? []) {
        s = applyEffect(s, effect);
      }
      // if the scene had a oncePerFlag set, set it
      if (scene.trigger?.oncePerFlag) {
        const f = new Set(s.storyFlags);
        f.add(scene.trigger.oncePerFlag);
        s = { ...s, storyFlags: f };
      }
      return s;
    }

    case 'DIALOG_CHOICE': {
      if (state.dialogStack.length === 0) return state;
      const top = state.dialogStack[state.dialogStack.length - 1];
      const scene = STORY_SCENES[top.sceneId];
      if (!scene?.choices) return state;
      const choice = scene.choices[action.choiceIndex];
      if (!choice) return state;
      let s: GameState = { ...state, dialogStack: state.dialogStack.slice(0, -1) };
      // If this scene had a oncePerFlag, set it now so the trigger doesn't refire.
      if (scene.trigger?.oncePerFlag) {
        const f = new Set(s.storyFlags);
        f.add(scene.trigger.oncePerFlag);
        s = { ...s, storyFlags: f };
      }
      for (const effect of choice.effects ?? []) {
        s = applyEffect(s, effect);
      }
      if (choice.nextSceneId) {
        s = {
          ...s,
          dialogStack: [...s.dialogStack, { sceneId: choice.nextSceneId, lineIndex: 0 }],
        };
      }
      return s;
    }

    case 'DIALOG_CLOSE':
      return { ...state, dialogStack: state.dialogStack.slice(0, -1) };

    case 'SET_FLAG': {
      const next = new Set(state.storyFlags);
      next.add(action.flag);
      return { ...state, storyFlags: next };
    }

    case 'CLEAR_FLAG': {
      const next = new Set(state.storyFlags);
      next.delete(action.flag);
      return { ...state, storyFlags: next };
    }

    case 'GIVE_BOT': {
      const bot = createBot(action.modelId, action.firstName, 1);
      if (!bot) return state;
      const discovered = new Set(state.discovered);
      discovered.add(bot.modelId);
      return { ...state, bots: [...state.bots, bot], discovered };
    }

    // -------- battle prep --------
    case 'QUEUE_BATTLE':
      return {
        ...state,
        pendingBattle: action.battle,
        battleSetupTeam: [],
        scene: 'battleSetup',
      };

    case 'TOGGLE_BATTLE_SELECT': {
      const maxSize = state.pendingBattle?.teamSize ?? 1;
      const team = [...state.battleSetupTeam];
      const idx = team.indexOf(action.botId);
      if (idx >= 0) team.splice(idx, 1);
      else if (team.length < maxSize) team.push(action.botId);
      return { ...state, battleSetupTeam: team };
    }

    case 'CANCEL_BATTLE':
      return { ...state, pendingBattle: null, battleSetupTeam: [], scene: 'location' };

    // -------- combat --------
    case 'COMBAT_SET':
      return { ...state, combat: action.combat, scene: 'combat' };

    case 'COMBAT_REPLACE':
      return { ...state, combat: action.combat };

    case 'COMBAT_PHASE':
      if (!state.combat) return state;
      return { ...state, combat: { ...state.combat, phase: action.phase } };

    case 'COMBAT_PICK_ACTION':
      if (!state.combat) return state;
      return {
        ...state,
        combat: {
          ...state.combat,
          action: action.action,
          phase: 'bot_choose',
          selectedBot: null,
          selectedAttack: null,
        },
      };

    case 'COMBAT_PICK_BOT':
      if (!state.combat) return state;
      return {
        ...state,
        combat: {
          ...state.combat,
          selectedBot: action.botId,
          phase: state.combat.action === 'item' ? 'item_choose' :
                 state.combat.action === 'defend' ? state.combat.phase :
                 'attack_choose',
        },
      };

    case 'COMBAT_PICK_ATTACK':
      if (!state.combat) return state;
      return {
        ...state,
        combat: {
          ...state.combat,
          selectedAttack: action.attackId,
          isSignature: action.isSignature,
          phase: 'target_choose',
        },
      };

    case 'COMBAT_PICK_ITEM':
      if (!state.combat) return state;
      return { ...state, combat: { ...state.combat, selectedItem: action.itemId } };

    case 'COMBAT_PICK_TARGET':
      // handled by orchestrator
      return state;

    case 'COMBAT_MESSAGE':
      if (!state.combat) return state;
      return { ...state, combat: { ...state.combat, message: action.message } };

    case 'COMBAT_BACK':
      if (!state.combat) return state;
      return {
        ...state,
        combat: {
          ...state.combat,
          phase: action.toPhase,
          ...(action.toPhase === 'player_select' ? { action: null, selectedBot: null, selectedAttack: null } : {}),
          ...(action.toPhase === 'bot_choose' ? { selectedAttack: null } : {}),
        },
      };

    // -------- post fight --------
    case 'POSTFIGHT_SET':
      return { ...state, postFight: action.data, combat: null, scene: 'postfight' };

    case 'POSTFIGHT_ACK':
      // handled by orchestrator (apply rewards, advance story)
      return state;

    // -------- assign item flow --------
    case 'OPEN_ASSIGN':
      return {
        ...state,
        assignItemContext: { botId: action.botId, category: null },
        scene: 'assignItem',
      };

    case 'ASSIGN_CATEGORY':
      if (!state.assignItemContext) return state;
      return {
        ...state,
        assignItemContext: { ...state.assignItemContext, category: action.category },
      };

    case 'ASSIGN_EQUIP': {
      const bot = state.bots.find(b => b.id === action.botId);
      if (!bot) return state;
      if (action.category === 'weapon') {
        const w = WEAPONS[action.itemId];
        if (!w) return state;
        if (w.type && w.type !== getBotType(bot)) {
          return { ...state, toast: `Requires ${w.type} type bot.`, toastId: state.toastId + 1 };
        }
        const nW = { ...state.weaponInv };
        nW[action.itemId] = (nW[action.itemId] ?? 0) - 1;
        if (nW[action.itemId] <= 0) delete nW[action.itemId];
        if (bot.weapon) nW[bot.weapon] = (nW[bot.weapon] ?? 0) + 1;
        return {
          ...state,
          weaponInv: nW,
          bots: state.bots.map(b => b.id === action.botId ? { ...b, weapon: action.itemId } : b),
        };
      } else {
        const a = ARMORS[action.itemId];
        if (!a) return state;
        const nA = { ...state.armorInv };
        nA[action.itemId] = (nA[action.itemId] ?? 0) - 1;
        if (nA[action.itemId] <= 0) delete nA[action.itemId];
        if (bot.armor) nA[bot.armor] = (nA[bot.armor] ?? 0) + 1;
        return {
          ...state,
          armorInv: nA,
          bots: state.bots.map(b => b.id === action.botId ? { ...b, armor: action.itemId } : b),
        };
      }
    }

    case 'ASSIGN_UNEQUIP': {
      const bot = state.bots.find(b => b.id === action.botId);
      if (!bot) return state;
      if (action.category === 'weapon') {
        if (!bot.weapon) return state;
        const nW = { ...state.weaponInv };
        nW[bot.weapon] = (nW[bot.weapon] ?? 0) + 1;
        return {
          ...state,
          weaponInv: nW,
          bots: state.bots.map(b => b.id === action.botId ? { ...b, weapon: null } : b),
        };
      } else {
        if (!bot.armor) return state;
        const nA = { ...state.armorInv };
        nA[bot.armor] = (nA[bot.armor] ?? 0) + 1;
        return {
          ...state,
          armorInv: nA,
          bots: state.bots.map(b => b.id === action.botId ? { ...b, armor: null } : b),
        };
      }
    }

    case 'ASSIGN_INSTALL_DISK': {
      const bot = state.bots.find(b => b.id === action.botId);
      const disk = DISKS[action.diskId];
      if (!bot || !disk) return state;
      if (!state.diskInv[action.diskId] || state.diskInv[action.diskId] <= 0) {
        return { ...state, toast: 'No disk in inventory.', toastId: state.toastId + 1 };
      }
      if (bot.disksUsed >= getDiskCapacity(bot)) {
        return { ...state, toast: 'At capacity. Level up to add more.', toastId: state.toastId + 1 };
      }
      if (disk.kind === 'attack') {
        if (disk.requiresType && disk.requiresType !== getBotType(bot)) {
          return { ...state, toast: `Requires ${disk.requiresType} type.`, toastId: state.toastId + 1 };
        }
        if (bot.learnedAttacks.includes(disk.attack)) {
          return { ...state, toast: 'Already knows this attack.', toastId: state.toastId + 1 };
        }
        const model = MODELS[bot.modelId];
        if (model.defaultAttacks.includes(disk.attack)) {
          return { ...state, toast: 'Already knows this attack.', toastId: state.toastId + 1 };
        }
      }
      const nD = { ...state.diskInv };
      nD[action.diskId] -= 1;
      if (nD[action.diskId] <= 0) delete nD[action.diskId];
      return {
        ...state,
        diskInv: nD,
        bots: state.bots.map(b => {
          if (b.id !== action.botId) return b;
          const nb = { ...b, disksUsed: b.disksUsed + 1 };
          if (disk.kind === 'stat') {
            nb.statBoosts = { ...nb.statBoosts, [disk.stat]: nb.statBoosts[disk.stat] + disk.value };
          } else {
            nb.learnedAttacks = [...nb.learnedAttacks, disk.attack];
          }
          return nb;
        }),
      };
    }

    case 'ASSIGN_CLOSE':
      return { ...state, assignItemContext: null, scene: 'stable' };

    // -------- market --------
    case 'BUY_WEAPON': {
      const w = WEAPONS[action.weaponId];
      if (!w || state.money < w.price) return state;
      return {
        ...state,
        money: state.money - w.price,
        weaponInv: { ...state.weaponInv, [action.weaponId]: (state.weaponInv[action.weaponId] ?? 0) + 1 },
        toast: `Acquired ${w.name}.`,
        toastId: state.toastId + 1,
      };
    }
    case 'BUY_ARMOR': {
      const a = ARMORS[action.armorId];
      if (!a || state.money < a.price) return state;
      return {
        ...state,
        money: state.money - a.price,
        armorInv: { ...state.armorInv, [action.armorId]: (state.armorInv[action.armorId] ?? 0) + 1 },
        toast: `Acquired ${a.name}.`,
        toastId: state.toastId + 1,
      };
    }
    case 'BUY_DISK': {
      const d = DISKS[action.diskId];
      if (!d || state.money < d.price) return state;
      return {
        ...state,
        money: state.money - d.price,
        diskInv: { ...state.diskInv, [action.diskId]: (state.diskInv[action.diskId] ?? 0) + 1 },
        toast: `Acquired ${d.name}.`,
        toastId: state.toastId + 1,
      };
    }
    case 'BUY_ITEM': {
      const it = ITEMS[action.itemId];
      if (!it || state.money < it.price) return state;
      return {
        ...state,
        money: state.money - it.price,
        items: { ...state.items, [action.itemId]: (state.items[action.itemId] ?? 0) + 1 },
        toast: `Acquired ${it.name}.`,
        toastId: state.toastId + 1,
      };
    }
    case 'BUY_MODEL': {
      const m = MODELS[action.modelId];
      if (!m?.price || state.money < m.price) return state;
      if (state.bots.length >= 5) {
        return { ...state, toast: 'Stable full (5 max).', toastId: state.toastId + 1 };
      }
      return {
        ...state,
        money: state.money - m.price,
        pendingNamingModelId: action.modelId,
        pendingNamingIsStarter: false,
        scene: 'naming',
      };
    }

    case 'SELL_MATERIAL': {
      const m = MATERIALS[action.materialId];
      if (!m) return state;
      const owned = state.materials[action.materialId] ?? 0;
      const count = Math.min(action.count, owned);
      if (count <= 0) return state;
      const nMats = { ...state.materials };
      nMats[action.materialId] = owned - count;
      if (nMats[action.materialId] <= 0) delete nMats[action.materialId];
      return {
        ...state,
        money: state.money + m.sellPrice * count,
        materials: nMats,
        toast: `Sold ${count}× ${m.name} for ${m.sellPrice * count} CR.`,
        toastId: state.toastId + 1,
      };
    }

    // -------- crew --------
    case 'SET_MENTOR_SKILL':
      return {
        ...state,
        crew: state.crew.map(c => c.id === action.botId ? { ...c, mentorSkill: action.skill } : c),
      };

    case 'RETIRE_EARLY': {
      const bot = state.bots.find(b => b.id === action.botId);
      if (!bot) return state;
      return {
        ...state,
        bots: state.bots.filter(b => b.id !== action.botId),
        crew: [
          ...state.crew,
          {
            ...bot,
            finalPower: 50,
            mentorSkill: 'attack',
            retiredAt: state.achievements.totalBattles,
          },
        ],
      };
    }

    // -------- alignment --------
    case 'NUDGE_ALIGNMENT':
      return {
        ...state,
        alignment: {
          moral: clamp(state.alignment.moral + (action.moral ?? 0), -100, 100),
          posture: clamp(state.alignment.posture + (action.posture ?? 0), -100, 100),
        },
      };

    // -------- tournaments --------
    case 'START_TOURNAMENT': {
      return {
        ...state,
        activeTournament: {
          tournamentId: action.tournamentId,
          bracketIndex: 0,
          teamBotIds: action.teamBotIds,
          fameAccumulated: 0,
          prizeAccumulated: 0,
        },
      };
    }
    case 'TOURNAMENT_END': {
      return { ...state, activeTournament: null };
    }
    case 'TOURNAMENT_NEXT_ROUND': {
      if (!state.activeTournament) return state;
      return {
        ...state,
        activeTournament: {
          ...state.activeTournament,
          bracketIndex: state.activeTournament.bracketIndex + 1,
        },
      };
    }
    case 'EVENT_PROGRESS': {
      const current = state.eventProgress[action.eventId] ?? -1;
      if (action.fightIndex <= current) return state;  // no regression
      return {
        ...state,
        eventProgress: { ...state.eventProgress, [action.eventId]: action.fightIndex },
      };
    }
    case 'CHAMPION_WIN': {
      const current = state.championWins[action.eventId] ?? 0;
      return {
        ...state,
        championWins: { ...state.championWins, [action.eventId]: current + 1 },
      };
    }
    case 'PROMOTE_TIER': {
      return { ...state, playerTier: action.tier };
    }

    // -------- combat side effects --------
    case 'CONSUME_ITEM': {
      const owned = state.items[action.itemId] ?? 0;
      if (owned <= 0) return state;
      const items = { ...state.items, [action.itemId]: owned - 1 };
      if (items[action.itemId] <= 0) delete items[action.itemId];
      return { ...state, items };
    }

    case 'APPLY_REWARDS': {
      const d = state.postFight;
      if (!d) return state;
      // money + xp + materials + loot, applied to participants
      const bots = state.bots.map(b => {
        const participated = d.participants.includes(b.id);
        if (!participated) return b;
        let u = { ...b };
        // XP
        u.xp += d.xpReward;
        while (u.xp >= u.xpToNext) {
          u = { ...u, xp: u.xp - u.xpToNext, level: u.level + 1, xpToNext: (u.level + 1) * 100, maxHp: u.maxHp + 8 };
        }
        // Win/loss
        if (d.won) { u.wins += 1; u.rankWins += 1; } else { u.losses += 1; }
        return u;
      });
      // Loot
      const weaponInv = { ...state.weaponInv };
      const armorInv = { ...state.armorInv };
      const diskInv = { ...state.diskInv };
      const items = { ...state.items };
      for (const l of d.lootDrops) {
        if (l.kind === 'item') items[l.id] = (items[l.id] ?? 0) + 1;
        else if (l.kind === 'weapon') weaponInv[l.id] = (weaponInv[l.id] ?? 0) + 1;
        else if (l.kind === 'armor') armorInv[l.id] = (armorInv[l.id] ?? 0) + 1;
        else if (l.kind === 'disk') diskInv[l.id] = (diskInv[l.id] ?? 0) + 1;
      }
      // Materials
      const materials = { ...state.materials };
      for (const m of d.materialDrops) {
        materials[m.id] = (materials[m.id] ?? 0) + m.count;
      }
      // Fame & defeated trainers
      const defeatedTrainerIds = new Set(state.defeatedTrainerIds);
      if (d.won && d.defeatedTrainerId) {
        defeatedTrainerIds.add(d.defeatedTrainerId);
      }
      // Achievements
      const ach = { ...state.achievements, totalBattles: state.achievements.totalBattles + 1 };
      if (d.source === 'junkyard' && d.won) ach.junkyardWins += 1;
      return {
        ...state,
        bots,
        money: state.money + d.prize,
        fame: state.fame + d.fameGained,
        defeatedTrainerIds,
        weaponInv,
        armorInv,
        diskInv,
        items,
        materials,
        achievements: ach,
        postFight: null,
        pendingBattle: null,
        battleSetupTeam: [],
        combat: null,
      };
    }

    default:
      return state;
  }
}

function clamp(n: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, n));
}

function applyEffect(state: GameState, effect: import('../data/story').SceneEffect): GameState {
  switch (effect.kind) {
    case 'setFlag': {
      const f = new Set(state.storyFlags); f.add(effect.flag);
      return { ...state, storyFlags: f };
    }
    case 'clearFlag': {
      const f = new Set(state.storyFlags); f.delete(effect.flag);
      return { ...state, storyFlags: f };
    }
    case 'giveBot': {
      // Every mecha acquisition routes through NamingScreen.
      // The actual bot creation happens via CONFIRM_NAMING after the player
      // picks a name.
      return {
        ...state,
        pendingNamingModelId: effect.modelId,
        pendingNamingIsStarter: true,
        scene: 'naming',
      };
    }
    case 'giveCredits':
      return { ...state, money: state.money + effect.amount };
    case 'unlockCity': {
      const c = new Set(state.unlockedCities); c.add(effect.cityId);
      return { ...state, unlockedCities: c };
    }
    case 'openNamingForModel':
      return {
        ...state,
        pendingNamingModelId: effect.modelId,
        pendingNamingIsStarter: true,
        scene: 'naming',
      };
    default:
      return state;
  }
}

// Re-export for typing convenience
export { initialState };
