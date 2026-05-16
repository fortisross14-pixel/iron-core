/**
 * CityPaletteProvider — wraps the app and provides the active city palette to
 * any descendant via useCityPalette().
 *
 * Reads state.currentCityId from GameStore. When the city changes, the palette
 * swaps and every component using useCityPalette() retints.
 *
 * Local overrides:
 *   <CityPaletteProvider override={...}>...</CityPaletteProvider>
 *   is used inside faction-house bodies to temporarily retint a subtree to the
 *   faction color instead of the city color.
 */

import { createContext, useContext, type ReactNode } from 'react';
import { useGame } from '../state/GameStore';
import {
  getCityPalette,
  NEUTRAL_PALETTE,
  type CityPalette,
} from './theme';

const PaletteCtx = createContext<CityPalette>(NEUTRAL_PALETTE);

export function CityPaletteProvider({ children, override }: { children: ReactNode; override?: CityPalette }) {
  const { state } = useGame();
  const palette = override ?? getCityPalette(state.currentCityId);
  return <PaletteCtx.Provider value={palette}>{children}</PaletteCtx.Provider>;
}

/** Temporarily override the active palette for a subtree.
 *  Used inside faction-house bodies to swap to faction color. */
export function PaletteOverride({ palette, children }: { palette: CityPalette; children: ReactNode }) {
  return <PaletteCtx.Provider value={palette}>{children}</PaletteCtx.Provider>;
}

export function useCityPalette(): CityPalette {
  return useContext(PaletteCtx);
}

/** Build a 5-shade palette from a single hex color. Used for faction overrides
 *  so the faction's main color produces a consistent c1..c5 family on the fly. */
export function makePaletteFromHex(hex: string): CityPalette {
  // Parse #rrggbb
  const m = /^#?([0-9a-f]{6})$/i.exec(hex);
  if (!m) return NEUTRAL_PALETTE;
  const n = parseInt(m[1], 16);
  const r = (n >> 16) & 0xff;
  const g = (n >> 8) & 0xff;
  const b = n & 0xff;
  const mk = (factor: number) => {
    const adjust = (ch: number) => {
      if (factor >= 1) return Math.min(255, Math.round(ch + (255 - ch) * (factor - 1)));
      return Math.max(0, Math.round(ch * factor));
    };
    const rr = adjust(r), gg = adjust(g), bb = adjust(b);
    return '#' + ((1 << 24) | (rr << 16) | (gg << 8) | bb).toString(16).slice(1);
  };
  return {
    c1: hex,
    c2: mk(1.35),
    c3: mk(0.75),
    c4: mk(0.45),
    c5: mk(0.15),
  };
}
