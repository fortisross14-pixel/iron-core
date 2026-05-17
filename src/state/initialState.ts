import type { GameState } from './types';

export const initialState: GameState = {
  scene: 'intro',
  dialogStack: [],

  playerName: '',

  factionId: null,
  alignment: { moral: 0, posture: 0 },

  fame: 0,
  playerTier: 'amateur',
  defeatedTrainerIds: new Set(),
  encounteredTrainerIds: new Set(),
  eventProgress: {},
  championWins: {},

  bots: [],
  crew: [],

  money: 100,
  weaponInv: {},
  armorInv: {},
  diskInv: {},
  batteryInv: {},
  items: { repair_kit: 1 },
  materials: {},
  discovered: new Set(),

  storyFlags: new Set(),
  currentCityId: 'ironhaven',
  currentLocationId: null,
  unlockedCities: new Set(['ironhaven']),
  unlockedTournaments: new Set(),
  unlockedFeatures: new Set(),

  pendingBattle: null,
  battleSetupTeam: [],
  combat: null,
  postFight: null,
  activeTournament: null,
  assignItemContext: null,

  pendingNamingModelId: null,
  pendingNamingIsStarter: false,
  pendingMoveLearns: [],
  pendingLevelUps: [],
  pendingCapture: null,

  toast: null,
  toastId: 0,

  achievements: {
    undergroundWins: 0,
    officialWins: 0,
    eliteWins: 0,
    totalBattles: 0,
    junkyardWins: 0,
  },
};
