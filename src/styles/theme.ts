/**
 * THEME — single source of truth for the visual layer.
 *
 * City palette system:
 *   Each city has a 5-shade palette (c1=intense, c2=bright, c3=mid, c4=dim, c5=deep).
 *   The CityPaletteProvider in /styles/cityPalette.tsx picks the active palette
 *   based on state.currentCityId. Components read `useCityPalette()` to get the
 *   active 5 shades AND use them for borders, glows, gradients, bands, text.
 *
 * Faction colors override LOCALLY inside faction-house bodies only (not chrome).
 *
 * "Cyberpunk" visual lexicon:
 *   - Bracket-corner frames (4 L-shapes per panel)
 *   - Notched / cut-corner accents on selected items
 *   - Edge bands (thin horizontal lines tapering into transparency)
 *   - Glow shadows on active elements (low-alpha box-shadow in c2)
 *   - Filled / outlined / ghost button variants
 *   - Faint dot/line grid backgrounds
 */

// ============================================================
// CITY PALETTES — 5 shades each. c1 most saturated, c5 deepest.
// ============================================================

export interface CityPalette {
  c1: string;  // intense (primary borders, key emphasis)
  c2: string;  // bright (active glows, highlight strokes)
  c3: string;  // mid (normal accent text, default buttons)
  c4: string;  // dim (subtle bands, inactive accents)
  c5: string;  // deep (filled backgrounds with city tint, gradient base)
}

export const CITY_PALETTES: Record<string, CityPalette> = {
  // Ironhaven — industrial foundry village. Iron-grey, gunmetal,
  // hazard-yellow accents (sparingly). The look of a smokey factory floor.
  ironhaven: {
    c1: '#c8c8d0',  // brushed steel — the dominant trim color
    c2: '#ffd84a',  // hazard-yellow — used very sparingly for highlights
    c3: '#8a8a92',  // mid steel-grey
    c4: '#3a3a42',  // deep iron
    c5: '#0e0e12',  // near-black backdrop
  },
  // Voltspire — storm town. Electric yellow-blue. Capacitor arc, lightning rods.
  voltspire: {
    c1: '#ffe450',  // electric yellow — primary lightning color
    c2: '#80f0ff',  // pale ionized cyan — secondary arc color
    c3: '#bfa830',  // mid yellow
    c4: '#3a2a08',  // dark amber
    c5: '#05080f',  // deep stormy background
  },
  // Hollowmere — coastal trade city on the bay. Deep ocean blue + bright aqua + chrome.
  hollowmere: {
    c1: '#3aa8ff',  // bright ocean blue
    c2: '#80e0ff',  // foam-aqua
    c3: '#1a6090',  // mid deep-water
    c4: '#0a2840',  // abyssal
    c5: '#020a14',  // night-sea backdrop
  },
  // Emberbold — volcanic town. Crimson, molten orange, charcoal.
  emberbold: {
    c1: '#ff5028',  // molten lava red-orange
    c2: '#ffb068',  // bright ember
    c3: '#a02810',  // banked coal
    c4: '#3a1408',  // burnt char
    c5: '#0e0604',  // black ash backdrop
  },
};

/** Fallback palette for unknown city ids — neutral amber (matches Ironhaven). */
export const DEFAULT_CITY_PALETTE: CityPalette = CITY_PALETTES.ironhaven;

/** Neutral / chrome palette — used in the travel screen and for any non-city UI. */
export const NEUTRAL_PALETTE: CityPalette = {
  c1: '#e0e0e8',
  c2: '#ffffff',
  c3: '#a0a0aa',
  c4: '#50505a',
  c5: '#15151a',
};

// ============================================================
// STATIC THEME — colors, fonts, spacing that don't change per city
// ============================================================

export const theme = {
  color: {
    // -- backgrounds (constant across cities; the tint comes from the palette) --
    bg: '#040406',
    bgRaised: '#0a0a0c',
    bgSunken: '#020203',
    panel: '#0f0f12',
    border: '#1a1a1f',
    borderStrong: '#2a2a30',

    // -- text --
    text: '#e8e8e0',
    textMuted: '#888',
    textDim: '#666',
    textVeryDim: '#444',
    textBlack: '#0a0a0c',

    // -- universal semantic colors (NOT city-tinted) --
    info: '#7df0ff',
    success: '#7fb069',
    warning: '#ffa500',
    danger: '#ff3060',
    gold: '#ffd700',

    // -- legacy fields kept for back-compat with existing screens --
    // Some screens still read theme.color.accent. Until those are migrated,
    // we provide a neutral value here. The new way: useCityPalette().c1.
    accent: '#ffb800',
    accentDim: '#ffb80040',
  },

  // -- mecha type colors (unchanged — type identity is global) --
  typeColor: {
    fire: '#ff7a3c',
    water: '#5fa8ff',
    lightning: '#ffd84a',
    ice: '#a8e6ff',
    earth: '#c08a4a',
    bio: '#7fb069',
    steel: '#b8b8c0',
    mental: '#c896ff',
  } as Record<string, string>,

  // -- faction colors (used only inside faction-house bodies and Medals) --
  factionColor: {
    naturesOwn: '#7fb069',
    elementalists: '#5fa8ff',
    industrials: '#ff8a3c',
  } as Record<string, string>,

  // -- typography --
  font: {
    display: "'Anton', 'Impact', sans-serif",
    mono: "'JetBrains Mono', 'Consolas', monospace",
    body: "'DM Sans', system-ui, sans-serif",
  },
  size: {
    h1: 30, h2: 22, h3: 17,
    body: 15, small: 13, tiny: 11, micro: 10,
  },
  space: {
    xs: 4, sm: 6, md: 10, lg: 14, xl: 18, xxl: 24,
  },
  letter: {
    tight: '0.5px', normal: '1px', wide: '2px', wider: '3px', widest: '5px',
  },
  z: {
    base: 1, tabs: 100, toast: 200, modal: 300,
  },
  maxWidth: 720,
};

export type Theme = typeof theme;

// ============================================================
// Helpers
// ============================================================

export const typeColor = (t: string) => theme.typeColor[t] || theme.color.textMuted;
export const factionColor = (f: string) => theme.factionColor[f] || theme.color.accent;

/** Get a city's palette by id (defaults to ironhaven). */
export function getCityPalette(cityId: string | null | undefined): CityPalette {
  if (!cityId) return DEFAULT_CITY_PALETTE;
  return CITY_PALETTES[cityId] ?? DEFAULT_CITY_PALETTE;
}
