/**
 * THEME — single source of truth for the visual layer.
 *
 * To reskin the entire game, edit this file. Every component reads colors,
 * fonts, and spacing from here. Hardcoded values in components are bugs.
 */

export const theme = {
  // ---------- color palette ----------
  color: {
    bg: '#050507',
    bgRaised: '#0d0d11',
    bgSunken: '#08080a',
    panel: '#15151a',
    border: '#1f1f25',
    borderStrong: '#2a2a30',

    text: '#e8e8e0',
    textMuted: '#888',
    textDim: '#666',
    textVeryDim: '#444',

    accent: '#ff6b35',        // primary brand color
    accentDim: '#ff6b3540',
    info: '#7df0ff',
    success: '#7fb069',
    warning: '#ffa500',
    danger: '#d4321c',
    gold: '#ffd700',
  },

  // ---------- mecha type colors ----------
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

  // ---------- faction colors ----------
  factionColor: {
    naturesOwn: '#7fb069',
    elementalists: '#5fa8ff',
    industrials: '#ff6b35',
  } as Record<string, string>,

  // ---------- typography ----------
  font: {
    display: "'Anton', sans-serif",      // headers, big numbers, chrome
    mono: "'JetBrains Mono', monospace", // stats, labels, system text
    body: "'DM Sans', system-ui, sans-serif",
  },

  size: {
    h1: 28,
    h2: 20,
    h3: 16,
    body: 14,
    small: 12,
    tiny: 10,
    micro: 9,
  },

  // ---------- spacing ----------
  space: {
    xs: 4,
    sm: 6,
    md: 10,
    lg: 14,
    xl: 18,
    xxl: 24,
  },

  // ---------- letter spacing ----------
  letter: {
    tight: '0.5px',
    normal: '1px',
    wide: '2px',
    wider: '3px',
    widest: '5px',
  },

  // ---------- z layers ----------
  z: {
    base: 1,
    tabs: 100,
    toast: 200,
    modal: 300,
  },

  // ---------- breakpoints ----------
  maxWidth: 520, // mobile-first; constrains app on desktop too
};

export type Theme = typeof theme;

// helpers — call these instead of constructing styles inline where possible
export const typeColor = (t: string) => theme.typeColor[t] || theme.color.textMuted;
export const factionColor = (f: string) => theme.factionColor[f] || theme.color.accent;
