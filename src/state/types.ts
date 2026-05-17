import type { Bot, CrewMember } from '../game/types';
import type { FactionId } from '../data/factions';
import type { CombatBot } from '../game/combat';

/**
 * Top-level scene determines which screen the App router renders.
 *
 * 'town' is the city map. 'location' is a specific building/area within a city.
 * 'dialog' overlays a story scene on top of whatever else is happening.
 */
export type Scene =
  | 'intro'
  | 'starter'
  | 'naming'
  | 'faction_pick'
  | 'town'
  | 'location'
  | 'combat'
  | 'postfight'
  | 'battleSetup'
  | 'assignItem'
  | 'stable'
  | 'crew'
  | 'ranking'
  | 'medals'
  | 'learnMove'
  | 'captureChoice'
  | 'me'
  | 'tournament_between'
  | 'levelUp';

export type DialogStackItem = {
  sceneId: string;
  lineIndex: number;
};

export interface PendingBattle {
  // who the player is fighting and why
  source: 'story' | 'junkyard' | 'tournament' | 'event' | 'trainer';
  sourceId: string;          // story scene id, tournament id, etc.
  oppLevel: number;
  oppRank: string;
  /** Player's team size CAP (max mechas they can field). Player can pick 1..teamSize. */
  teamSize: number;
  /** Opponent's team size. Defaults to `teamSize` when not specified.
   *  Set explicitly when player cap differs from opp count (e.g. wild fights:
   *  player up to 2, opp always 1). */
  oppTeamSize?: number;
  forceModelId?: string;
  forceFirstName?: string;
  prize: number;
  xpReward: number;
  fameReward?: number;       // fame paid on win, in addition to per-trainer fame
  // who you're fighting (for trainer battles & fame attribution)
  trainerId?: string;
  // event context (for tier_test, tournament, gauntlet)
  eventId?: string;
  eventFightIndex?: number;    // 0-based
  // for tournaments: array of fights to play through
  tournamentBracket?: TournamentFight[];
  // story hooks
  onWinSceneId?: string;
  onLossSceneId?: string;
  onWinFlags?: string[];
  onLossFlags?: string[];
  unlockCityId?: string;
  // for junkyard / grind places
  isWild?: boolean;
  wildModelId?: string;       // the actual model to spawn (capture target)
  materialDropLevel?: number;
}

export interface TournamentFight {
  trainerId?: string;
  forceModelId?: string;
  forceFirstName?: string;
  oppLevel: number;
  fameReward: number;
}

export interface CombatRuntime {
  player: CombatBot[];
  opp: CombatBot[];
  battleRound: number;
  phase: CombatPhase;
  action: CombatAction | null;
  selectedBot: string | null;       // player bot id
  selectedAttack: string | null;
  isSignature: boolean;
  selectedItem: string | null;
  message: CombatMessage | null;    // mid-screen action message
  summary: CombatSummary;
  playerSelectedIds: string[];      // original ids picked at setup
  tournamentRound?: number;
  maxTournamentRound?: number;
  source: PendingBattle['source'];
  sourceId: string;
}

export type CombatPhase =
  | 'player_select'        // top menu: ATTACK / ITEM / DEFEND
  | 'bot_choose'           // pick which of your bots
  | 'attack_choose'        // pick an attack
  | 'item_choose'          // pick an item
  | 'target_choose'        // pick an enemy to target
  | 'enemy_turn'           // animating enemy turn
  | 'round_end';

export type CombatAction = 'attack' | 'item' | 'defend' | 'self_repair' | 'self_charge' | 'abandon';

export interface CombatMessage {
  text: string;
  emphasis?: 'crit' | 'super' | 'resisted' | 'miss' | 'status';
}

export interface CombatSummary {
  dmgDealt: number;
  dmgTaken: number;
  hits: number;
  crits: number;
  sigsUsed: number;
  statusDamage: number;
}

export interface PostFightData {
  won: boolean;
  prize: number;
  xpReward: number;
  fameGained: number;
  defeatedTrainerId?: string;
  /** Trainer fought regardless of outcome (sets encountered flag). */
  encounteredTrainerId?: string;
  /** Wild mecha captured (after victory in a grind fight). Triggers KEEP/SALVAGE prompt. */
  wildModelId?: string;
  wildLevel?: number;
  source: PendingBattle['source'];
  sourceId: string;
  title: string;          // shown in result banner subtitle
  participants: string[];
  summary: CombatSummary;
  lootDrops: LootDrop[];
  materialDrops: { id: string; count: number }[];
  modelReward?: string;
  // for multi-round tournaments
  isTournamentMidBracket?: boolean;
  /** HP/BAT snapshot of player team after the fight, keyed by bot id.
   *  Used to carry over state to the next tournament fight. */
  playerEndState?: Record<string, { hp: number; bat: number }>;
  // story hooks to fire after the result is acknowledged
  nextSceneId?: string;
  flagsToSet?: string[];
  cityToUnlock?: string;
}

export type LootDrop =
  | { kind: 'item'; id: string }
  | { kind: 'weapon'; id: string }
  | { kind: 'armor'; id: string }
  | { kind: 'disk'; id: string };

export interface ActiveTournament {
  tournamentId: string;
  bracketIndex: number;          // next fight to run
  teamBotIds: string[];          // team picked once for the whole bracket
  fameAccumulated: number;
  prizeAccumulated: number;
  /** HP/battery values to carry over from previous fight, keyed by bot id.
   *  Set when a tournament fight ends; consumed when the next fight starts. */
  carryOver?: Record<string, { hp: number; bat: number }>;
}

export interface GameState {
  scene: Scene;
  // dialog overlay (if active, renders on top of current scene)
  dialogStack: DialogStackItem[];

  // player identity (set on first 'Me' tab visit or via prologue later)
  playerName: string;

  // player & faction
  factionId: FactionId | null;
  // alignment moves with player actions on the (moral, posture) quadrant
  alignment: { moral: number; posture: number };

  // career / ranking
  fame: number;
  playerTier: import('../data/trainers').TrainerTier;
  defeatedTrainerIds: Set<string>;
  /** Trainers the player has fought (won OR lost). Drives Ranking screen visibility. */
  encounteredTrainerIds: Set<string>;
  /** Per-fight progress for multi-fight events. eventId → highest cleared fight index (zero-based). -1 means none cleared. */
  eventProgress: Record<string, number>;
  /** Number of times the player has fully won each tournament (champion). Used by the Medals tab. */
  championWins: Record<string, number>;

  // bots
  bots: Bot[];
  crew: CrewMember[];

  // inventory
  money: number;
  weaponInv: Record<string, number>;
  armorInv: Record<string, number>;
  diskInv: Record<string, number>;
  batteryInv: Record<string, number>;
  items: Record<string, number>;
  materials: Record<string, number>;
  discovered: Set<string>;

  // world state
  storyFlags: Set<string>;
  currentCityId: string;
  currentLocationId: string | null;
  unlockedCities: Set<string>;
  unlockedTournaments: Set<string>;
  unlockedFeatures: Set<string>;

  // combat
  pendingBattle: PendingBattle | null;
  battleSetupTeam: string[];               // selected bot ids
  combat: CombatRuntime | null;
  postFight: PostFightData | null;
  // active tournament context (if running a bracket)
  activeTournament: ActiveTournament | null;
  assignItemContext: { botId: string; category: 'weapon' | 'armor' | 'disk' | 'battery' | null } | null;

  // naming flow (after starter pick OR after capture)
  pendingNamingModelId: string | null;
  pendingNamingIsStarter: boolean;
  pendingCaptureLevel?: number;  // level to spawn the captured bot at (defaults to 1)

  // move-learn queue: when bots level up and learn new attacks, each prompt
  // is queued here. The first item drives the LearnMoveScreen.
  pendingMoveLearns: { botId: string; newAttackId: string }[];

  // level-up announcement queue: when a bot levels up, we capture a before/after
  // snapshot so the LevelUpScreen can show what changed. Drained one at a time.
  pendingLevelUps: {
    botId: string;
    newLevel: number;
    /** Stats AT the level the bot was BEFORE leveling — for delta display. */
    prevStats: { hp: number; attack: number; defense: number; speed: number; intelligence: number };
    /** Stats AT the new level. */
    newStats:  { hp: number; attack: number; defense: number; speed: number; intelligence: number };
  }[];

  // capture/salvage prompt after winning a grind fight against a wild mecha.
  // null when no decision pending.
  pendingCapture: { modelId: string; level: number } | null;

  // toast
  toast: string | null;
  toastId: number;

  // achievements & stats
  achievements: {
    undergroundWins: number;
    officialWins: number;
    eliteWins: number;
    totalBattles: number;
    junkyardWins: number;
  };
}
