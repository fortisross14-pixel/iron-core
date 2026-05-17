/**
 * generate_mecha_csv.ts
 * Outputs all 99 mecha prompts as CSV: name, type, rarity, description
 *
 * Run: npx tsx scripts/generate_mecha_csv.ts > mechas.csv
 */

import { MODEL_LIST } from '../src/data/models';

const STYLE_LOCK = `Cartoon-manga style mecha illustration. Bold black ink linework, flat cel-shaded colors with strong highlight pass. Clean 90s anime aesthetic with modern detail. Saturated colors, no photorealism.`;

const NO_CHROME = `IMPORTANT: This is interior artwork only. Do NOT include any card border, frame, title text, name banner, type label, rarity badge, stat bars, ID number, quote, signature, watermark, or UI elements of any kind. Pure illustration, edge-to-edge, no overlaid graphics or text anywhere.`;

const SHOT_FULL = `Shot: Full body, dynamic action pose, mid-combat stance. Heroic three-quarter angle, slight low camera looking up to convey power. Background: dark stormy arena, type-themed atmospheric effects in the air, motion lines suggesting energy or movement. Full body centered in frame, head near the top third. 3:4 portrait aspect ratio, 768x1024 resolution. No text, no logos, no card design — only the illustration itself.`;

const SHOT_MINI = `MINI VERSION INSTRUCTIONS: Same character and style as above. Passport-style head-and-shoulders photo. Front-facing, centered, neutral pose, head and upper shoulders filling 70% of the canvas, square 1:1 aspect ratio, 512x512. Subject framed for a circular crop — all important detail in the middle 70% of the frame, corners can be empty/dark. Plain dark backdrop with subtle type-themed gradient. No body action, no motion lines — just a clean ID portrait of the mecha's face and upper shoulders.`;

// Per-type visual signature
const TYPE_SIG: Record<string, { palette: string; sig: string }> = {
  fire: {
    palette: 'Scorched orange-red primary, dark iron-grey secondary, glowing molten orange accents at the vents.',
    sig: 'Glowing red-orange heat vents on the shoulders, back, and chest. Visible smoke and embers rising from exhaust ports. Magma-cracked seams along armor with faint orange glow leaking through. Soot streaks down from every vent.',
  },
  water: {
    palette: 'Deep ocean blue primary, pale aqua secondary, chrome-silver and cyan-glowing accents.',
    sig: 'Hydraulic tubing visible at joints, pressurized fluid windows on the chest, dripping condensation along edges. Pale cyan glow from fluid cores. Salt-eaten paint along the lower armor.',
  },
  lightning: {
    palette: 'Electric yellow primary, black secondary, white-hot accents at the visor and coils.',
    sig: 'Exposed copper coils on neck, shoulders, and spine, with arcs of electricity jumping between contact points. Yellow-blue plasma glow at the visor slit. Crackling energy on the fingertips.',
  },
  ice: {
    palette: 'Pale steel-blue primary, frost-white secondary, glacial cyan glow accents.',
    sig: 'Frosted armor plates with crystalline shards growing from shoulders and back. Vapor mist rising from the body. Pale cyan glow at the eyes. Frozen condensation on the armor seams.',
  },
  earth: {
    palette: 'Brown-tan stone primary, granite-grey secondary, mineral-gold accents.',
    sig: 'Stone armor plates with rough granular texture and mineral inclusions. Moss and lichen growing on shoulders. Cracked geological surface with veins of crystal showing through. Earthy weathering.',
  },
  bio: {
    palette: 'Forest-green primary, bark-brown secondary, chlorophyll-glow accents.',
    sig: 'Vine-wrapped limbs and torso, mossy growths covering shoulders, organic curved plating that looks part-grown part-built. Green chlorophyll glow from the chest core. Root-like cabling at joints.',
  },
  steel: {
    palette: 'Polished gunmetal primary, brushed-aluminum secondary, hazard-yellow industrial accents.',
    sig: 'Polished plating with exposed rivets and bolt-heads, hydraulic pistons visible at joints, industrial hazard decals on the shoulders. Brushed-metal finish with oil streaks and factory-floor wear.',
  },
  mental: {
    palette: 'Deep violet primary, pale lavender secondary, hot-pink and white psionic accents.',
    sig: 'Floating geometric halos near the head, third-eye sensor on the forehead, neural cable patterns running across the armor. Purple-pink glow from the eyes and fractal etchings on the plates.',
  },
};

// Per-mecha design hook — what makes THIS one visually distinct from siblings of the same type
const DESIGN_HOOKS: Record<string, string> = {
  // ---- STARTERS ----
  hearthling: "A small, hand-built fire mecha with an unfinished workshop look. Patches of mismatched paint and visible weld seams. One eye-lens slightly brighter than the other. Looks like an apprentice's first build.",
  tideling: "A round, friendly water-frame with a stout barrel torso and broad flat hands. Soft curves, no sharp edges. Almost cute. Forgiving stance.",
  sprouting: "A small bio-frame with mismatched limbs and visible green saplings growing out of its shoulders. Half built, half grown. Patient round face.",

  // ---- FIRE ----
  cinderboar: "A squat, broad-shouldered tank chassis built like a charging boar. Tusked faceplate with two short curved horn-vents glowing red-orange. Heavy reinforced shoulder plates with exhaust vents on the back. Thick legs with treaded armored feet.",
  emberpup: "A small canine-frame, lean and excitable, with a snub muzzle and floppy ear-vents that flicker with flame. Tail-cable swinging behind. Loyal posture but eyes too bright.",
  forge_walker: "A massive squared-off industrial walker with a forge-furnace chest. Two thick smokestacks rising from the shoulders. Heavy slow legs like a kiln on stilts. Visible fire roaring inside the chest cavity.",
  smokebat: "A winged skirmisher-frame with leathery armor flaps stretched between arms and torso. Narrow predator face. Trails of dark smoke billowing from the underside as it moves.",
  magma_lizard: "A four-limbed reptilian frame in a crouched stance, armored back plates cracked with glowing lava veins. Long thick tail. Spiked dorsal ridge. Cool-grey scales on top, molten orange underneath.",
  furnace_hound: "A wolf-frame built for pack hunts. Long muzzle full of glowing teeth. Lean racing shoulders. Tail of trailing flame. Stance like it's about to lunge.",
  pyre_serpent: "A serpent-frame coiled around itself, armored scales running down a long sinuous body. Hooded head like a cobra with glowing eye-slits. No legs — slithers and rears.",
  flame_phoenix: "An avian frame with wide flame-feather wings outstretched, body covered in overlapping fire-plumed armor. Long crested head. Burning corona around the silhouette.",
  solar_panther: "A sleek feline predator-frame, four legs, low slung muscular body, gleaming gold-plated armor. Mane of fiber-optic light around the neck. Eyes like twin suns.",
  helios_guard: "A massive radiant tank-frame, broad shield-arm built into the left side, halo of sun-mirror plates around the head. Solemn stance. Light pours from the visor slits.",
  inferno_knight: "A bipedal warrior-frame in full plate armor, twin pauldrons venting fire, curved horns rising from the helmet. Cape of glowing embers behind. Sword-hand smoldering.",
  ragnar_drake: "A massive draconic mecha rearing on hind legs, vast leathery wings half-spread, long horned skull-face roaring with internal fire. Spine of plated armor scales. Wild and ancient.",

  // ---- WATER ----
  shore_drone: "A small utility frame with rusted blue paint, fishhook-shaped hands, and a single forward sensor eye. Looks like dock equipment that learned to walk.",
  tidewall: "A massive bulwark-frame, almost rectangular, with shield-walls built into both forearms. Squat stance, fortress-like. Water cascading down the armor from internal cisterns.",
  brinekit: "A small lithe water-frame with finned feet and a long tail-rudder. Always wet, dripping. Playful stance, looks like it's about to dart sideways.",
  reefling: "A short hunched mecha covered in coral-encrusted armor, plates growing organic shell-patterns. Tide-pool barnacles on the shoulders. Slow patient gait.",
  riptide_runner: "A sleek streamlined sprinter, hydrodynamic plates angled back, water-jets at the heels. Lean torso, long whip-like arms. Built like a racing scull.",
  hydra_jr: "A two-headed serpentine frame, both heads on long flexible necks rising from a central body. Each head has its own personality of helmet design. Eight short clawed feet.",
  whaleguard: "A vast cetacean-shaped war-frame, broad rounded body with sonar-pulse plates on the flanks. Small comparatively-tiny head and short flippered limbs. Moves like a swimming whale.",
  storm_marlin: "A lance-bladed frame with a long forward-thrust spear-nose built into the helmet. Fins along the spine. Hydrodynamic, aggressive forward lean.",
  abyss_walker: "A deep-sea creature mecha with bioluminescent lures on its head and shoulders. Long thin limbs, pressure-hardened armor. Glowing in deep dark blue.",
  kraken_minor: "A tentacle-armed mecha with six articulated tentacle-limbs sprouting from a central armored core. Single great eye on the body. Each tentacle ends in a different tool.",
  leviathan_ii: "A vast slow-moving leviathan-frame, prototype label still on the armor. Massive flat head, body wider than tall, plated like a battleship. Trails water and steam.",
  poseidon_mk1: "A crowned god-king mecha holding a trident, draped in armor like ceremonial regalia. Long flowing cape-of-water behind. Towering, regal stance with one foot forward.",

  // ---- LIGHTNING ----
  voltrunner: "A narrow sprinter chassis with a slim visored head and a horizontal sensor slit glowing yellow-white. Antenna-fins sweep back from the temples. Exposed copper coils at neck and shoulders, sparking. Long thin limbs with reinforced calf pistons. Cracked yellow paint with black accents.",
  brittle_charge: "An abandoned junkyard frame, paint mostly peeled, exposed wiring and capacitors dangling. Sparks erratically from broken contacts. Slightly hunched, missing one shoulder plate. Pitiful but dangerous.",
  sparkfly: "A tiny insect-frame, four wing-blades buzzing electrically, oversized lens-eyes. Light skeletal armor. Hovers just above the ground on arc-thrust feet.",
  conduit_pup: "A small four-legged frame with antennae, dishes on its back acting as charge-routers. Wide friendly eyes. Cables run along the spine glowing yellow.",
  storm_cur: "A lean canine hunter, gaunt and aggressive, with electrical sparks shorting across its dorsal spines. Snarling visor. Tail of crackling chain-lightning.",
  arc_marauder: "An underground-racing build, low-slung muscular bipedal frame with exposed wiring on the chest. Aggressive bouncer-style helmet. Lightning bolts tattooed onto the armor.",
  thunder_owl: "A wide-winged owl-frame, big circular sensor-eyes, feathered armor plates fluffed up. Talons crackling. Stands perched like it's about to swoop.",
  voltlord: "A regal frame with a crown of high-voltage spires around the head. Cape of arcing lightning. Stands tall and imperious, arms crossed.",
  storm_lancer: "A heavy lance-knight, electrified spear in one hand, shield in the other. Charged visor. Cape of lightning behind. Forward thrust-stance.",
  thunderbird: "A massive avian frame with vast crackling wings spread wide. Long crested head with a sharp beak-visor. Talons gripping the ground, sparks at every contact point.",
  arc_titan: "A walking lightning rod — tall and lean with a tower-spike rising from its head and shoulders. Massive arcs jumping between body parts. Body framework barely contains the energy.",
  zeus_prime: "A god-king mecha holding a lightning-spear, beard of cabling, ceremonial armor crackling with eternal storm. Cloak of stormclouds behind. Imposing.",

  // ---- ICE ----
  glassthorn: "A lean skirmisher in pale frost-blue armor, sharp shard-thorns growing out of the shoulders and forearms. Thin sleek build. Cold breath vapor at the visor.",
  frostpaw: "A small cold-runner cub-frame, soft white armor with grey accents, paw-tipped feet. Round innocent face, glowing pale eyes. Vapor trailing from the body.",
  icicle_drone: "A floating drone-frame with hanging icicle-spike weapons under the body. Single sensor-eye. Wings of frosted glass.",
  rimewolf: "A wolf hunter-frame with white-blue fur-textured armor and frost-cracked plating. Lean pack-hunter stance. Glowing pale-cyan eyes. Frosted muzzle.",
  frost_titan_jr: "A smaller version of a glacier titan — broad squared-off armor, ice-block shoulders, blocky helmet. Solid stance. Calm patient eyes.",
  bliz_serpent: "A snake-frame, long sinuous body in white-blue scales, hooded head with frost-fangs. Blizzard wind trailing from its scales as it moves.",
  glacier_ram: "A heavy ram-headed brawler with massive curving horns of solid ice, broad shoulders, low charging stance. Cracked white-blue armor.",
  ice_archer: "A long-range frame with a crystalline bow in one hand, quiver of ice-arrows on the back. Lean refined silhouette. Hood of frost over the helmet.",
  frostbloom: "A crystalline bio-frame, body part-armor part-flowering-ice. Flower-shaped crystal blooms on the shoulders and chest. Pale ethereal beauty.",
  cryogon: "An ancient ten-thousand year frame, body almost entirely encased in glacial ice. Glowing slits where eyes used to be. Slow but immense menace.",
  frost_titan: "A walking glacier — vast columnar legs, body like a moving iceberg, head a craggy ice-block with two glowing slits. Slow inevitable presence.",
  fimbul_wolf: "A wild king wolf-frame, massive shaggy fur-armor in white and silver, horns of curved ice. Eyes burning pale blue. Pack-leader stance, head lowered.",

  // ---- EARTH ----
  scrap_grunt: "A reliable foundry frame in brown-and-rust armor, blocky and squarish. Hammer-fists. Visor like a welder's mask. Plain and dependable.",
  pebble_kin: "A small earth-frame that looks like a humanoid pile of cobblestones, plates loosely linked. Friendly round face. Trails small rocks.",
  digbug: "A burrowing insect-frame with drill-claws and a pointed snout-helmet. Six legs, low-slung body. Covered in tunnel-dust.",
  stone_jack: "A blocky brawler shaped like a walking sledgehammer. Wide shoulders, narrow waist, oversized fist-hands of solid stone. Aggressive forward lean.",
  rockwarden: "A massive stone bulwark-frame, body like a fortress wall on legs. Square shield-plates as armor. Solemn patient stance, no aggression.",
  granite_boar: "A four-legged boar-frame in granite armor, tusks of crystal, low charging stance. Stocky and unstoppable.",
  loam_lurker: "A hunched ambusher-frame with soil-caked armor, half-buried look. Long arms ending in shovel-claws. Eyes peeking out from a dirt-crowned helmet.",
  obsidian_ape: "A primate-frame in glossy black volcanic-glass armor, broad chest, long powerful arms reaching past the knees. Beats its chest stance.",
  geode_serpent: "A long serpent-frame with a spine of crystal geodes glowing from within. Coiled body of mineral plates. Glowing crystal eyes.",
  mountain_lord: "A massive mountain-king frame, body of layered stone armor like cliff strata, head a craggy peak. Sleeps standing, eyes barely open.",
  golem_alpha: "A pre-Sundering ancient warrior-frame, primitive stone-plate armor over a humanoid body. Runic carvings glowing faintly on the chest. Eternal silent stance.",
  atlas_xii: "A titanic mecha carrying small hills on its shoulders. Massive humanoid body of stone and brass plating. Bearing the weight of literal mountains.",

  // ---- BIO ----
  "pollen_one": "A small half-built half-grown frame, mismatched mechanical and organic parts. Flowers blooming from the chest. Friendly upturned face.",
  feral_grub: "An abandoned junkyard bio-frame, half-rotted, vines and fungal growths overrunning the armor. Hunched, snarling, wild-eyed. Forgotten and feral.",
  mosspup: "A soft furry-armored bio-frame, body like a small bear cub but mechanical. Moss growing on the back. Round patient eyes. Healer posture.",
  thorncrawler: "A lean four-legged bio-scout with vine-wrapped limbs, thorn-spikes along the spine. Lizard-like silhouette. Quick darting eyes.",
  sap_serpent: "A serpent-frame with bark-textured armor and oozing sap-glow from joints. Long sinuous body. Fanged hood-head. Drips amber.",
  rootbeast: "A massive anchored bio-frame, lower body merging into a root-system that grips the ground. Upper body hulking with bark armor. Slow and immovable.",
  spore_witch: "A tall thin bio-frame with a witch-hat fungal cap, body wreathed in spore-clouds. Long thin limbs. Glowing eyes peering through the mist.",
  bramble_lion: "A lion-frame with a wild mane of thorned vines. Powerful four-legged body, bio-armored shoulders, snarling face. Mane crackles when angry.",
  fungal_kraken: "A nightmare bio-frame with fungal tentacles erupting from the body, decomposer aesthetic. Multiple eyes on the central torso. Lives off the dead.",
  worldtree_jr: "A bipedal sapling-frame, body of young tree-bark, leaves growing from the shoulders and head. Calm wise face. Glowing green core.",
  grovemother: "A regal female-coded bio-frame, robe of overlapping leaf-plates, crown of branches, glowing chest-flower. Queen of the green, serene.",
  yggdra: "A vast ancient tree-mecha, body part-trunk part-warrior. Walking slowly. Branches sprouting from the back, roots dragging behind. Speaks in growths.",

  // ---- STEEL ----
  iron_jack: "A classic pit-fighter frame, scuffed metal armor, broad shoulders, square jaw-helmet. Boxer stance, fists up. Working-class grit.",
  rust_husk: "An abandoned steel frame, paint long gone, surface mottled with red-orange rust. Hunched, limping silhouette. Hollow gaze.",
  rivet_kin: "A repair-frame with utility arms ending in welding torches and bolt-drivers. Friendly engineer-style visor. Toolbelt of dangling parts.",
  scrap_knight: "A hand-welded knight-frame, every piece a different scrap of armor jury-rigged together. Visor mismatched. Holds a salvaged sword.",
  steel_boar: "A heavy industrial boar-frame, riveted plate armor in factory yellow, tusks of polished steel. Charging stance, low and aggressive.",
  cannon_squire: "A young squire-frame with an oversized cannon-arm strapped to its right side. Visibly braces against the recoil. Determined face.",
  bunker_drake: "A walking bunker — squat fortress-frame with thick concrete-and-steel armor, slit visor, no neck. Moves like a tank.",
  warforge: "A massive assault frame built for siege circuits. Brutalist plating, exhaust stacks on the back, hammer-fist on one arm. Industrial menace.",
  iron_centaur: "A four-legged combat frame with a humanoid upper torso on a quadruped lower body. Polished steel plates. Lance in one hand, shield in the other.",
  bastion_xi: "A walking fortress with multiple shield-walls deployed from shoulders and forearms. Heavy crown-helmet. Defensive stance. Banner of the faction draped on the chest.",
  ironwolf: "An industrial wolf-frame, lean predator silhouette in polished gunmetal. Mechanical wolf-head with red sensor-eyes. Built for the assembly-line hunt.",
  juggernaut_a: "A factory-floor champion, massive shoulders, smokestack vents, ceremonial belt around the waist. Stoic boxer stance. Scarred plating.",

  // ---- MENTAL ----
  mindless: "A hollow-eyed humanoid frame in pale grey-violet armor, expressionless visor. Empty silent presence. Limbs hang loose.",
  echoling: "A small frame with multiple sensor-ears arrayed around the head, body covered in repeating fractal patterns. Tilted listening posture.",
  blank_jr: "A young curious-stance frame with question-mark insignias on the chest. Head tilted, one hand raised as if asking something.",
  daydream: "A blurry-edged frame, body slightly translucent in places, drifting silhouette. Eyes half-closed. Looks like it's not entirely there.",
  mindlance: "A sharp-edged precision frame with a forward-thrust visor-blade. Thin elegant body. Eyes piercing, focused.",
  thinker: "A heavyset philosopher-frame with a domed head and contemplative crossed arms. Robe-like armor draped over the body. Eyes closed.",
  oracle_jr: "A young seer-frame with a third-eye sensor on the forehead and floating geometric runes around the head. Hands raised in foresight gesture.",
  archivist: "A scholar-frame with a long scroll-cape, hood up, mechanical owl perched on one shoulder. Holds a glowing memory-orb. Calm.",
  dreamhound: "A wolf-frame with smoke-like trailing edges, body half-real. Hunts in dreams. Wide pale glowing eyes. Predator silhouette.",
  oracle_alpha: "A high seer-frame draped in flowing armor, multiple third-eyes arranged on a halo around the head. Serene, all-knowing pose.",
  void_walker: "A frame whose edges flicker as if stepping between dimensions. Body cut with geometric voids. Faceless visor. Mid-stride between worlds.",
  prime_mind: "A profoundly aware frame, tall and slender, with a halo of floating thought-shards. Single calm eye. The first mecha that may be truly conscious.",

  // ---- GOD ----
  alpha_omega: "A primordial mythic frame, archaic geometric design with sacred-geometry patterns etched everywhere. Halo of orbiting platonic solids. Pre-Sundering aesthetic. Both ancient and futuristic.",
  ironmind: "A steel god-frame with a sovereign crown of cabling, body of unblemished industrial perfection. Stands with the certainty of refusal. The first frame that learned to say no.",
  worldfire: "A fire god-frame, body wreathed in eternal flame, no clear seams between armor and burning. Faceless inferno-helm. Spontaneous existence — nobody built this.",
};

const RARITY_LABEL: Record<string, string> = {
  starter: 'Starter',
  common: 'Common',
  uncommon: 'Uncommon',
  rare: 'Rare',
  epic: 'Epic',
  legendary: 'Legendary',
  god: 'God-Type',
};

function csvEscape(s: string): string {
  // Wrap in quotes and escape internal quotes by doubling them
  return '"' + s.replace(/"/g, '""') + '"';
}

function buildPrompt(m: typeof MODEL_LIST[0]): string {
  const tSig = TYPE_SIG[m.type];
  const designHook = DESIGN_HOOKS[m.id] || `A distinct ${m.type}-type combat frame.`;
  const rarityLabel = RARITY_LABEL[m.rarity];

  const subjectBlock = `Subject: A humanoid combat mecha named ${m.surname}, a ${m.type}-type ${m.role} in an arena fighting circuit. ${rarityLabel} rarity.`;
  const designBlock = `Design: ${designHook}`;
  const paletteBlock = `Color palette: ${tSig.palette}`;
  const typeSig = `Type signature: ${tSig.sig}`;

  return [
    STYLE_LOCK,
    '',
    NO_CHROME,
    '',
    subjectBlock,
    '',
    designBlock,
    '',
    paletteBlock,
    '',
    typeSig,
    '',
    SHOT_FULL,
    '',
    SHOT_MINI,
  ].join('\n');
}

function main() {
  // Header row
  const rows: string[] = ['name,type,rarity,description'];
  for (const m of MODEL_LIST) {
    const prompt = buildPrompt(m);
    rows.push([csvEscape(m.surname), csvEscape(m.type), csvEscape(m.rarity), csvEscape(prompt)].join(','));
  }
  console.log(rows.join('\n'));
}

main();
