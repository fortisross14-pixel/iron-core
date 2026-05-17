import type { Bot } from '../game/types';
import type { FactionId } from '../data/factions';
import type {
  CombatAction, CombatMessage, CombatPhase, CombatRuntime,
  GameState, LootDrop, PendingBattle, PostFightData, Scene,
} from './types';

/**
 * All state mutations go through these typed actions. UI components dispatch
 * actions; reducer is the only place that mutates state.
 */
export type Action =
  // ---- general nav ----
  | { type: 'GO_SCENE'; scene: Scene }
  | { type: 'TOAST'; message: string }
  | { type: 'TOAST_CLEAR' }
  // ---- starter / naming ----
  | { type: 'PICK_STARTER_MODEL'; modelId: string }
  | { type: 'CONFIRM_NAMING'; firstName: string }
  // ---- faction ----
  | { type: 'PICK_FACTION'; factionId: FactionId }
  // ---- city / location ----
  | { type: 'ENTER_LOCATION'; locationId: string }
  | { type: 'LEAVE_LOCATION' }
  | { type: 'SWITCH_CITY'; cityId: string }
  | { type: 'UNLOCK_CITY'; cityId: string }
  // ---- story / dialog ----
  | { type: 'OPEN_DIALOG'; sceneId: string }
  | { type: 'DIALOG_ADVANCE' }
  | { type: 'DIALOG_CHOICE'; choiceIndex: number }
  | { type: 'DIALOG_CLOSE' }
  | { type: 'SET_FLAG'; flag: string }
  | { type: 'CLEAR_FLAG'; flag: string }
  | { type: 'GIVE_BOT'; modelId: string; firstName?: string }
  // ---- battle prep ----
  | { type: 'QUEUE_BATTLE'; battle: PendingBattle }
  | { type: 'TOGGLE_BATTLE_SELECT'; botId: string }
  | { type: 'SET_BATTLE_TEAM'; botIds: string[] }
  | { type: 'START_BATTLE'; teamBots: Bot[] }
  | { type: 'CANCEL_BATTLE' }
  // ---- combat ----
  | { type: 'COMBAT_SET'; combat: CombatRuntime }
  | { type: 'COMBAT_PHASE'; phase: CombatPhase }
  | { type: 'COMBAT_PICK_ACTION'; action: CombatAction }
  | { type: 'COMBAT_PICK_BOT'; botId: string }
  | { type: 'COMBAT_PICK_ATTACK'; attackId: string; isSignature: boolean }
  | { type: 'COMBAT_PICK_ITEM'; itemId: string }
  | { type: 'COMBAT_PICK_TARGET'; targetId: string }
  | { type: 'COMBAT_MESSAGE'; message: CombatMessage | null }
  | { type: 'COMBAT_BACK'; toPhase: CombatPhase }
  | { type: 'COMBAT_REPLACE'; combat: CombatRuntime }
  // ---- post fight ----
  | { type: 'POSTFIGHT_SET'; data: PostFightData }
  | { type: 'POSTFIGHT_ACK' }
  // ---- assign item ----
  | { type: 'OPEN_ASSIGN'; botId: string }
  | { type: 'ASSIGN_CATEGORY'; category: 'weapon' | 'armor' | 'disk' | 'battery' }
  | { type: 'ASSIGN_EQUIP'; botId: string; category: 'weapon' | 'armor' | 'battery'; itemId: string }
  | { type: 'ASSIGN_UNEQUIP'; botId: string; category: 'weapon' | 'armor' | 'battery' }
  | { type: 'ASSIGN_INSTALL_DISK'; botId: string; diskId: string }
  | { type: 'ASSIGN_CLOSE' }
  // ---- market ----
  | { type: 'BUY_WEAPON'; weaponId: string; price?: number }
  | { type: 'BUY_ARMOR'; armorId: string }
  | { type: 'BUY_BATTERY'; batteryId: string }
  | { type: 'BUY_DISK'; diskId: string }
  | { type: 'BUY_ITEM'; itemId: string }
  | { type: 'BUY_MODEL'; modelId: string }
  | { type: 'SELL_MATERIAL'; materialId: string; count: number }
  // ---- crew ----
  | { type: 'SET_MENTOR_SKILL'; botId: string; skill: 'attack' | 'defense' | 'speed' }
  | { type: 'RETIRE_EARLY'; botId: string }
  // ---- alignment ----
  | { type: 'NUDGE_ALIGNMENT'; moral?: number; posture?: number }
  // ---- combat side effects ----
  | { type: 'CONSUME_ITEM'; itemId: string }
  | { type: 'APPLY_REWARDS' }
  // ---- tournaments ----
  | { type: 'START_TOURNAMENT'; tournamentId: string; teamBotIds: string[] }
  | { type: 'TOURNAMENT_NEXT_ROUND' }
  | { type: 'TOURNAMENT_END' }
  // ---- events / tier progression ----
  | { type: 'EVENT_PROGRESS'; eventId: string; fightIndex: number }
  | { type: 'CHAMPION_WIN'; eventId: string }
  | { type: 'PROMOTE_TIER'; tier: import('../data/trainers').TrainerTier }
  // ---- move learning ----
  | { type: 'MOVE_LEARN_RESOLVE'; replaceAttackId: string | null }
  // ---- capture / salvage ----
  | { type: 'CAPTURE_KEEP' }
  | { type: 'CAPTURE_SALVAGE' }
  // ---- crew management ----
  | { type: 'PROMOTE_TO_CREW'; botId: string }
  // ---- player identity ----
  | { type: 'SET_PLAYER_NAME'; name: string }
  // ---- workshop services ----
  | { type: 'WORKSHOP_FULL_HEAL' }
  // ---- tournament between-fight actions ----
  | { type: 'TOURNAMENT_USE_ITEM'; itemId: string; botId: string }
  | { type: 'TOURNAMENT_ABANDON' };
