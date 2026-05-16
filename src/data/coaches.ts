/**
 * COACHES — all named opponents in the game.
 *
 * "Coach" is the domain term covering: amateur ladder trainers, official
 * examiners, faction-house challengers, story-bosses (Krait etc.). They
 * all share the same shape: team, fame, tier, optional reward on first
 * defeat.
 *
 * EDITING:
 *   - Rename a coach: change `firstName` / `surname` here. No other file
 *     touched.
 *   - Adjust difficulty: change `level` in their `team`.
 *   - Change fame value: edit `fame`.
 *
 * The id-based references throughout the codebase (am_001, ex_forge, etc.)
 * are stable. Names are not.
 *
 * Naming conventions:
 *   am_NNN  — amateur ladder trainer
 *   ex_XXX  — examiner (used in tier tests)
 *   fc_XXX  — faction-house challenger (Step 3b)
 *   pr_NNN  — pro-tier ladder trainer (Step 3+)
 *   el_NNN  — elite-tier ladder trainer (Step 3+)
 *   boss_X  — story bosses (Krait, etc.)
 */

export type TrainerTier = 'amateur' | 'official' | 'professional' | 'elite';

export interface CoachTeamSlot {
  modelId: string;
  level: number;
}

/** Reward granted on FIRST defeat of this coach (in addition to fame). */
export interface CoachReward {
  credits?: number;
  items?: string[];
  weapons?: string[];
  disks?: string[];
  mechas?: string[];     // wild capture; Step 3d
}

export interface Trainer {     // legacy name kept for type re-export compatibility
  id: string;
  firstName: string;
  surname: string;
  tier: TrainerTier;
  fame: number;
  homeCityId: string;
  flavor: string;
  team: CoachTeamSlot[];
  /** Optional one-time reward on first defeat (faction-house and special coaches). */
  reward?: CoachReward;
}

// alias for clarity in new code
export type Coach = Trainer;

// ============================================================
// AMATEUR TIER (30 trainers, fame 2–820)
// ============================================================
//
// Distribution roughly:
//   bottom 10:  2–50   (just-graduated, no real wins)
//   middle 10:  60–280 (active competitors)
//   upper 7:    320–520 (local champions)
//   top 3:      620 / 720 / 820 (regional names — boss-tier amateurs)

export const TRAINERS_AMATEUR: Record<string, Trainer> = {
  // ---- bottom 10: rookies just out of school ----
  am_001: { id: 'am_001', firstName: 'Vey',     surname: 'Pelt',     tier: 'amateur', fame: 2,   homeCityId: 'ironhaven', flavor: 'Hasn\'t won a sanctioned bout yet.',  team: [{ modelId: 'scrap_grunt', level: 1 }] },
  am_002: { id: 'am_002', firstName: 'Doss',    surname: 'Brale',    tier: 'amateur', fame: 4,   homeCityId: 'ironhaven', flavor: 'Practices alone in the schoolyard.',  team: [{ modelId: 'shore_drone', level: 1 }] },
  am_003: { id: 'am_003', firstName: 'Mira',    surname: 'Quell',    tier: 'amateur', fame: 6,   homeCityId: 'ironhaven', flavor: 'Lost three Senior Cups in a row.',    team: [{ modelId: 'iron_jack',   level: 1 }] },
  am_004: { id: 'am_004', firstName: 'Hex',     surname: 'Rouse',    tier: 'amateur', fame: 9,   homeCityId: 'ironhaven', flavor: 'Mostly known for showing up.',        team: [{ modelId: 'voltrunner',  level: 1 }] },
  am_005: { id: 'am_005', firstName: 'Pell',    surname: 'Stade',    tier: 'amateur', fame: 12,  homeCityId: 'ironhaven', flavor: 'Won once. Talks about it constantly.',team: [{ modelId: 'glassthorn', level: 2 }] },
  am_006: { id: 'am_006', firstName: 'Onyx',    surname: 'Vale',     tier: 'amateur', fame: 18,  homeCityId: 'voltspire', flavor: 'Junkyard regular.',                   team: [{ modelId: 'pollen_one', level: 2 }] },
  am_007: { id: 'am_007', firstName: 'Caro',    surname: 'Hask',     tier: 'amateur', fame: 22,  homeCityId: 'voltspire', flavor: 'Quiet. Doesn\'t talk before matches.',team: [{ modelId: 'scrap_grunt', level: 2 }] },
  am_008: { id: 'am_008', firstName: 'Brak',    surname: 'Ember',    tier: 'amateur', fame: 28,  homeCityId: 'ironhaven', flavor: 'Wears too much steel.',               team: [{ modelId: 'iron_jack',   level: 2 }] },
  am_009: { id: 'am_009', firstName: 'Lira',    surname: 'Cinder',   tier: 'amateur', fame: 36,  homeCityId: 'voltspire', flavor: 'Bets her own prize money.',           team: [{ modelId: 'cinderboar', level: 2 }] },
  am_010: { id: 'am_010', firstName: 'Sable',   surname: 'Drove',    tier: 'amateur', fame: 48,  homeCityId: 'ironhaven', flavor: 'On a 4-fight streak.',                team: [{ modelId: 'tidewall',   level: 2 }] },
  // ---- middle 10 ----
  am_011: { id: 'am_011', firstName: 'Renn',    surname: 'Stovepipe',tier: 'amateur', fame: 65,  homeCityId: 'ironhaven', flavor: 'Industrial-aligned.',                 team: [{ modelId: 'iron_jack',   level: 3 }] },
  am_012: { id: 'am_012', firstName: 'Asha',    surname: 'Greenway', tier: 'amateur', fame: 82,  homeCityId: 'voltspire', flavor: "Nature's Own affiliate.",             team: [{ modelId: 'pollen_one', level: 3 }] },
  am_013: { id: 'am_013', firstName: 'Tarek',   surname: 'Saltrun',  tier: 'amateur', fame: 105, homeCityId: 'voltspire', flavor: 'Elementalist convergence regular.',   team: [{ modelId: 'shore_drone', level: 3 }] },
  am_014: { id: 'am_014', firstName: 'Quin',    surname: 'Mavik',    tier: 'amateur', fame: 130, homeCityId: 'voltspire', flavor: 'Specializes in lightning frames.',    team: [{ modelId: 'voltrunner',  level: 3 }] },
  am_015: { id: 'am_015', firstName: 'Bex',     surname: 'Holloran', tier: 'amateur', fame: 155, homeCityId: 'ironhaven', flavor: 'Trains in the junkyard.',             team: [{ modelId: 'rockwarden', level: 3 }] },
  am_016: { id: 'am_016', firstName: 'Cyon',    surname: 'Petra',    tier: 'amateur', fame: 180, homeCityId: 'voltspire', flavor: 'Twice a Bronze finalist.',            team: [{ modelId: 'glassthorn', level: 4 }] },
  am_017: { id: 'am_017', firstName: 'Drust',   surname: 'Achery',   tier: 'amateur', fame: 210, homeCityId: 'voltspire', flavor: 'Underground fighter.',                team: [{ modelId: 'cinderboar', level: 4 }] },
  am_018: { id: 'am_018', firstName: 'Vera',    surname: 'Idris',    tier: 'amateur', fame: 240, homeCityId: 'voltspire', flavor: 'Owns a stable of four.',              team: [{ modelId: 'tidewall',   level: 4 }] },
  am_019: { id: 'am_019', firstName: 'Junip',   surname: 'Mar',      tier: 'amateur', fame: 265, homeCityId: 'voltspire', flavor: 'Has placed in three Bronze events.',  team: [{ modelId: 'rockwarden', level: 4 }] },
  am_020: { id: 'am_020', firstName: 'Roa',     surname: 'Westmoor', tier: 'amateur', fame: 285, homeCityId: 'voltspire', flavor: "Won the last Voltspire Bronze.",      team: [{ modelId: 'iron_jack',   level: 4 }] },
  // ---- upper 7 ----
  am_021: { id: 'am_021', firstName: 'Thane',   surname: 'Korven',   tier: 'amateur', fame: 325, homeCityId: 'voltspire', flavor: 'A name in Elementalist circles.',     team: [{ modelId: 'cinderboar', level: 5 }] },
  am_022: { id: 'am_022', firstName: 'Mavi',    surname: 'Salt',     tier: 'amateur', fame: 365, homeCityId: 'voltspire', flavor: 'Two-time Bronze winner.',             team: [{ modelId: 'tidewall',   level: 5 }] },
  am_023: { id: 'am_023', firstName: 'Ember',   surname: 'Halt',     tier: 'amateur', fame: 410, homeCityId: 'voltspire', flavor: 'Burned out three frames last year.',  team: [{ modelId: 'cinderboar', level: 5 }] },
  am_024: { id: 'am_024', firstName: 'Cinder',  surname: 'Voss',     tier: 'amateur', fame: 445, homeCityId: 'voltspire', flavor: 'Said to be considering the Test.',    team: [{ modelId: 'rockwarden', level: 6 }] },
  am_025: { id: 'am_025', firstName: 'Ash',     surname: 'Pelarn',   tier: 'amateur', fame: 480, homeCityId: 'voltspire', flavor: 'Industrial-sponsored.',               team: [{ modelId: 'iron_jack',   level: 6 }] },
  am_026: { id: 'am_026', firstName: 'Wrack',   surname: 'Demont',   tier: 'amateur', fame: 510, homeCityId: 'voltspire', flavor: 'Bronze regional finalist.',           team: [{ modelId: 'glassthorn', level: 6 }] },
  am_027: { id: 'am_027', firstName: 'Nail',    surname: 'Estren',   tier: 'amateur', fame: 535, homeCityId: 'voltspire', flavor: 'Holds the regional ladder rank.',     team: [{ modelId: 'pollen_one', level: 6 }] },
  // ---- top 3 ----
  am_028: { id: 'am_028', firstName: 'Hollow',  surname: 'Kade',     tier: 'amateur', fame: 620, homeCityId: 'voltspire', flavor: '#3 amateur. Quiet, brutal, fast.',    team: [{ modelId: 'voltrunner',  level: 7 }, { modelId: 'glassthorn', level: 7 }] },
  am_029: { id: 'am_029', firstName: 'Echo',    surname: 'Marrick',  tier: 'amateur', fame: 720, homeCityId: 'voltspire', flavor: '#2 amateur. Defending Bronze champion.',team: [{ modelId: 'rockwarden', level: 8 }, { modelId: 'cinderboar', level: 8 }] },
  am_030: { id: 'am_030', firstName: 'Glass',   surname: 'Halloran', tier: 'amateur', fame: 820, homeCityId: 'voltspire', flavor: '#1 amateur. Has refused the Official Test twice.', team: [{ modelId: 'tidewall',   level: 9 }, { modelId: 'cinderboar', level: 9 }] },
};

// ============================================================
// OFFICIAL TIER — examiners + circuit trainers
// ============================================================

export const TRAINERS_OFFICIAL: Record<string, Trainer> = {
  ex_forge: {
    id: 'ex_forge',
    firstName: 'Marrow', surname: 'Forge',
    tier: 'official', fame: 900,
    homeCityId: 'hollowmere',
    flavor: 'Official Examiner. Fire/Steel specialist. Hits first, hits hardest.',
    team: [
      { modelId: 'cinderboar', level: 12 },
      { modelId: 'iron_jack',  level: 12 },
    ],
  },
  ex_tide: {
    id: 'ex_tide',
    firstName: 'Veda', surname: 'Tide',
    tier: 'official', fame: 950,
    homeCityId: 'hollowmere',
    flavor: 'Official Examiner. Water/Bio sustain. Outlasts you.',
    team: [
      { modelId: 'tidewall',   level: 12 },
      { modelId: 'pollen_one', level: 13 },
    ],
  },
  ex_storm: {
    id: 'ex_storm',
    firstName: 'Cass', surname: 'Storm',
    tier: 'official', fame: 1000,
    homeCityId: 'hollowmere',
    flavor: 'Official Examiner. Lightning/Ice speed. Disables your team before you act.',
    team: [
      { modelId: 'voltrunner', level: 13 },
      { modelId: 'glassthorn', level: 13 },
    ],
  },
};

// ============================================================
// COMBINED LOOKUP
// ============================================================

export const ALL_TRAINERS: Record<string, Trainer> = {
  ...TRAINERS_AMATEUR,
  ...TRAINERS_OFFICIAL,
};

export const TRAINER_LIST: Trainer[] = Object.values(ALL_TRAINERS);

/** Alias for new code. Existing imports of ALL_TRAINERS still work. */
export const ALL_COACHES = ALL_TRAINERS;
export const COACH_LIST = TRAINER_LIST;

export function trainerRankWithinTier(trainerId: string): number {
  const t = ALL_TRAINERS[trainerId];
  if (!t) return -1;
  const tier = TRAINER_LIST.filter(x => x.tier === t.tier).sort((a, b) => b.fame - a.fame);
  return tier.findIndex(x => x.id === trainerId) + 1;
}
