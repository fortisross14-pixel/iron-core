/**
 * STORY SYSTEM
 *
 * The story is a list of named SCENES. Each scene is a sequence of dialogue
 * beats and effects (set a flag, give an item, trigger a battle, etc.).
 *
 * Scenes are triggered in two ways:
 *   1. Auto-triggered when the player enters a location, if their flags match.
 *   2. Manually triggered (e.g., "Talk to Uncle" button inside a location).
 *
 * Story flags are simple string IDs stored in state. Scenes can require a flag
 * to be set, or absent, to fire.
 *
 * To add story: add a Scene to STORY_SCENES. To add a flag: just use any
 * string ID — it's added to the set when set, removed when cleared.
 */

export type Speaker = 'narrator' | 'uncle' | 'krait' | 'player' | 'grove_keeper' | 'elemental_chief' | 'industrial_clerk' | 'school_principal';

export interface DialogueLine {
  speaker: Speaker;
  text: string;
}

export type SceneEffect =
  | { kind: 'setFlag'; flag: string }
  | { kind: 'clearFlag'; flag: string }
  | { kind: 'giveBot'; modelId: string; firstName?: string }
  | { kind: 'giveCredits'; amount: number }
  | { kind: 'startBattle'; battleId: string }
  | { kind: 'goToScene'; sceneId: string }
  | { kind: 'unlockCity'; cityId: string };

export interface Scene {
  id: string;
  // auto-fires when entering a location, if all `requireFlags` are set AND no `forbidFlags` are set
  trigger?: {
    locationId?: string;
    requireFlags?: string[];
    forbidFlags?: string[];
    oncePerFlag?: string;   // sets this flag after firing so it doesn't repeat
  };
  lines: DialogueLine[];
  effects?: SceneEffect[];
  // if defined, scene ends with a choice and effects branch from the choice
  choices?: Array<{
    label: string;
    effects?: SceneEffect[];
    nextSceneId?: string;
  }>;
}

// ============================================================
// PROLOGUE
// ============================================================

export const STORY_SCENES: Record<string, Scene> = {

  // --- opens once when game starts (auto via App)
  prologue_open: {
    id: 'prologue_open',
    lines: [
      { speaker: 'narrator', text: 'You wake up the morning of your graduation. Your room smells faintly of solder — your uncle\'s shop is downstairs.' },
      { speaker: 'narrator', text: 'Today you can do whatever you like. There is one thing your uncle asked you to do first: come down to the workshop before you leave.' },
    ],
    effects: [
      { kind: 'setFlag', flag: 'prologue_seen' },
    ],
  },

  // --- fires when entering uncle's workshop the first time
  uncle_gift: {
    id: 'uncle_gift',
    trigger: {
      locationId: 'iron_workshop',
      requireFlags: ['prologue_seen'],
      forbidFlags: ['uncle_gift_received'],
      oncePerFlag: 'uncle_gift_received',
    },
    lines: [
      { speaker: 'uncle', text: 'There you are. Sit down a minute.' },
      { speaker: 'uncle', text: 'Your mother told me you were thinking about the Operator track. I figured you would.' },
      { speaker: 'uncle', text: 'I made you something. Don\'t — don\'t make a face. Just look.' },
      { speaker: 'narrator', text: 'Your uncle pulls a tarp off a frame in the corner. It\'s a fire-type, smaller than most. Hand-built. Your initials are carved into the chest plate.' },
      { speaker: 'uncle', text: 'Her name is up to you. Frame designation\'s Hearthling — that\'s my joke, you don\'t have to keep it.' },
      { speaker: 'uncle', text: 'Listen. The road out of town is right there. But I want you to remember something before you walk it.' },
      { speaker: 'uncle', text: 'You don\'t train mechs. You train with them. They get one decade, same as us. Don\'t waste hers.' },
    ],
    effects: [
      { kind: 'giveBot', modelId: 'hearthling' },
    ],
  },

  // --- fires when entering Smelter's Gate without having beaten Krait
  krait_first: {
    id: 'krait_first',
    trigger: {
      locationId: 'iron_gate',
      forbidFlags: ['krait_first_seen'],
      oncePerFlag: 'krait_first_seen',
    },
    lines: [
      { speaker: 'narrator', text: 'A heavy-set man is leaning against the gate post, picking grit out from under a thumbnail. His mech — an old earth-frame — is parked across the road.' },
      { speaker: 'krait', text: 'Going somewhere, kid?' },
      { speaker: 'krait', text: 'See, that\'s the problem. Every spring some graduate from the school down the way walks up here thinking they\'re going to be the next Apex champion.' },
      { speaker: 'krait', text: 'And every spring I send them home.' },
      { speaker: 'krait', text: 'Name\'s Krait. Toll-Taker. Town pays me to make sure no idiots leave who shouldn\'t.' },
      { speaker: 'krait', text: 'You want past me? Show me you can hold a frame steady.' },
    ],
  },

  // --- fires after losing to Krait the first time
  krait_lost: {
    id: 'krait_lost',
    lines: [
      { speaker: 'krait', text: 'There. See? Told you.' },
      { speaker: 'narrator', text: 'Krait helps you up. He looks less angry than before. Almost — disappointed in a familiar way.' },
      { speaker: 'krait', text: 'But — alright. I\'ll give you this. You\'ve got a hand for it. Most kids your age would\'ve cracked in the second round. You held until the fourth.' },
      { speaker: 'krait', text: 'There\'s a junkyard half a kilometer south. Old mechs that got abandoned out there years ago. They\'re feral but they\'re weak.' },
      { speaker: 'krait', text: 'Go train. When you can take me, you can pass.' },
    ],
    effects: [
      { kind: 'setFlag', flag: 'krait_defeated_player' },
    ],
  },

  // --- fires after winning the Krait rematch
  krait_won: {
    id: 'krait_won',
    lines: [
      { speaker: 'krait', text: 'Hah. There it is. There\'s the Operator.' },
      { speaker: 'krait', text: 'Alright. Road\'s yours. Voltspire is two days east. Don\'t — listen — don\'t pick a faction the first day. They will all want you. Watch first.' },
    ],
    effects: [
      { kind: 'setFlag', flag: 'krait_rematch_won' },
      { kind: 'unlockCity', cityId: 'voltspire' },
    ],
  },

  // --- fires the first time you enter your house after prologue
  home_morning: {
    id: 'home_morning',
    trigger: {
      locationId: 'iron_home',
      requireFlags: ['prologue_seen'],
      forbidFlags: ['home_morning_seen'],
      oncePerFlag: 'home_morning_seen',
    },
    lines: [
      { speaker: 'narrator', text: 'Your room. The bed is made. There\'s a note on the dresser from your mother — "Be good. Come back."' },
    ],
  },

  // --- fires the first time you enter the academy after prologue
  academy_first: {
    id: 'academy_first',
    trigger: {
      locationId: 'iron_academy',
      forbidFlags: ['academy_first_seen'],
      oncePerFlag: 'academy_first_seen',
    },
    lines: [
      { speaker: 'narrator', text: 'The old training yard. A few seniors are still here practicing. The principal recognizes you and waves you over.' },
      { speaker: 'school_principal', text: 'You graduated yesterday. You don\'t have to keep coming back, you know.' },
      { speaker: 'school_principal', text: 'But — the Senior Cup is in a few days. If you want to enter, I\'ll waive the fee for graduates. It\'s small stakes. Good first match for whatever you\'re training.' },
    ],
    // (the actual tournament entry happens via a separate "talk to principal" button; this is just the intro)
  },

  // --- fires entering Voltspire Square the first time
  voltspire_arrive: {
    id: 'voltspire_arrive',
    trigger: {
      locationId: 'volt_square',
      forbidFlags: ['voltspire_arrived'],
      oncePerFlag: 'voltspire_arrived',
    },
    lines: [
      { speaker: 'narrator', text: 'Two days east. The pylons hum from a kilometer out. Voltspire is bigger than Ironhaven by an order of magnitude.' },
      { speaker: 'narrator', text: 'Three faction houses ring the central plaza. From the look of the foot traffic, all three are actively recruiting.' },
      { speaker: 'narrator', text: 'You think about what Krait said. Watch first.' },
    ],
  },

  // --- faction recruitment scenes (one per faction, fire on first visit)
  natures_first: {
    id: 'natures_first',
    trigger: {
      locationId: 'volt_natures',
      forbidFlags: ['natures_first_seen'],
      oncePerFlag: 'natures_first_seen',
    },
    lines: [
      { speaker: 'narrator', text: 'A walled garden. The Grove-Keeper is sitting cross-legged on a flat stone, repairing a bio-frame the size of a small bear.' },
      { speaker: 'grove_keeper', text: 'You\'re young. Mm. Come here. Don\'t mind the seedlings.' },
      { speaker: 'grove_keeper', text: 'We don\'t recruit hard. If you decide you want to wear our colors, you come back and tell me. Until then — sit. Listen. We host a Bio circuit every solstice. Quiet. Honest.' },
    ],
  },
  elemental_first: {
    id: 'elemental_first',
    trigger: {
      locationId: 'volt_elemental',
      forbidFlags: ['elemental_first_seen'],
      oncePerFlag: 'elemental_first_seen',
    },
    lines: [
      { speaker: 'narrator', text: 'A circle of wagons. Smoke and salt. Someone hands you a tin cup of something hot before you\'ve even said your name.' },
      { speaker: 'elemental_chief', text: 'You walked all the way from Ironhaven? Hah. Welcome.' },
      { speaker: 'elemental_chief', text: 'We don\'t have a building because we don\'t need one. We have storms. We fight on the road, on the river, in the foothills. If you want to ride with us, you don\'t fill out paperwork. You just show up.' },
    ],
  },
  industrial_first: {
    id: 'industrial_first',
    trigger: {
      locationId: 'volt_industrial',
      forbidFlags: ['industrial_first_seen'],
      oncePerFlag: 'industrial_first_seen',
    },
    lines: [
      { speaker: 'narrator', text: 'A clean stone building. The receptionist takes your name on a paper ledger and gestures you toward a polished wooden bench.' },
      { speaker: 'industrial_clerk', text: 'Welcome to the Industrial Hall. We sponsor Operators on a contract basis.' },
      { speaker: 'industrial_clerk', text: 'You get a stipend. You get priority registration in every Bronze and Silver event east of Ironhaven. In return, you wear our colors and you don\'t fight in any Elementalist convergence without our approval.' },
      { speaker: 'industrial_clerk', text: 'Read the contract before you sign. Take it home. We\'re not in a hurry.' },
    ],
  },
};
