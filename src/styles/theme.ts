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
  // Ironhaven — forge village. Amber. Warm. Workshop-glow.
  ironhaven: {
    c1: '#ffb800',
    c2: '#ffd84a',
    c3: '#d4a020',
    c4: '#7a5e1f',
    c5: '#2b1f08',
  },
  // Voltspire — storm town. Electric blue. Cold. Capacitor-arc.
  voltspire: {
    c1: '#00d4ff',
    c2: '#50e8ff',
    c3: '#2090c0',
    c4: '#0f4060',
    c5: '#04111c',
  },
  // Hollowmere — coastal trade city. Magenta. Hot. Neon-trader.
  hollowmere: {
    c1: '#ff2a90',
    c2: '#ff6cc0',
    c3: '#c04080',
    c4: '#6a1f48',
    c5: '#1f0a14',
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
    h1: 28, h2: 20, h3: 16,
    body: 14, small: 12, tiny: 10, micro: 9,
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
  maxWidth: 520,
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
