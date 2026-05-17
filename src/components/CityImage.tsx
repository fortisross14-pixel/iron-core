/**
 * CityImage — renders a city's mini (circular) or full image.
 *
 * Files live at:
 *   - /public/assets/locations/<cityId>_mini.webp  (256x256)
 *   - /public/assets/locations/<cityId>_full.webp  (~1024x768, used as travel
 *     screen and town-page background)
 *
 * Falls back to a palette-tinted placeholder if no file is present.
 *
 * Use:
 *   <CityMini cityId="ironhaven" size={48} />   — for list rows and headers
 *   <CityFull cityId="ironhaven" />              — for travel screen / town bg
 */

import { CSSProperties, useState } from 'react';
import { CITIES } from '../data/cities';
import { CITY_PALETTES, DEFAULT_CITY_PALETTE } from '../styles/theme';

interface MiniProps {
  cityId: string;
  size?: number;
  borderColor?: string;
}

export function CityMini({ cityId, size = 44, borderColor }: MiniProps) {
  const [loaded, setLoaded] = useState(false);
  const [errored, setErrored] = useState(false);
  const city = CITIES[cityId];
  const palette = CITY_PALETTES[cityId] ?? DEFAULT_CITY_PALETTE;
  const border = borderColor ?? palette.c1;
  const url = `${import.meta.env.BASE_URL}assets/locations/${cityId}_mini.webp`;

  const wrap: CSSProperties = {
    width: size,
    height: size,
    borderRadius: '50%',
    border: `1.5px solid ${border}`,
    overflow: 'hidden',
    flexShrink: 0,
    position: 'relative',
    background: `radial-gradient(circle at 30% 30%, ${palette.c3}40, ${palette.c5})`,
    boxShadow: `0 0 10px ${border}40`,
  };
  const img: CSSProperties = {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    display: loaded && !errored ? 'block' : 'none',
  };
  const placeholder: CSSProperties = {
    width: '100%',
    height: '100%',
    display: !loaded || errored ? 'flex' : 'none',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: size * 0.42,
    color: palette.c2,
    fontFamily: 'VT323, monospace',
    textShadow: `0 0 6px ${border}`,
  };

  // Fallback initial — first letter of city name, in city palette
  const initial = city?.name?.[0] ?? '?';

  return (
    <div style={wrap} aria-label={city?.name ?? cityId}>
      <img src={url} alt="" style={img}
        onLoad={() => setLoaded(true)}
        onError={() => setErrored(true)} />
      <div style={placeholder}>{initial}</div>
    </div>
  );
}

interface FullProps {
  cityId: string;
  /** If true, image is rendered greyscale + dimmed (used as town-view backdrop). */
  greyed?: boolean;
  /** Optional override style. */
  style?: CSSProperties;
}

/**
 * Full city image. Used for:
 *   - Travel screen (full color, large)
 *   - Town-view background (greyed)
 */
export function CityFull({ cityId, greyed = false, style }: FullProps) {
  const [loaded, setLoaded] = useState(false);
  const [errored, setErrored] = useState(false);
  const palette = CITY_PALETTES[cityId] ?? DEFAULT_CITY_PALETTE;
  const url = `${import.meta.env.BASE_URL}assets/locations/${cityId}_full.webp`;

  const wrap: CSSProperties = {
    width: '100%',
    aspectRatio: '4 / 3',
    position: 'relative',
    overflow: 'hidden',
    background: `radial-gradient(ellipse at center, ${palette.c3}80, ${palette.c5})`,
    border: `1px solid ${palette.c1}40`,
    ...style,
  };
  const img: CSSProperties = {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    display: loaded && !errored ? 'block' : 'none',
    filter: greyed ? 'grayscale(85%) brightness(0.4) contrast(1.1)' : 'none',
    transition: 'filter 0.3s',
  };
  const placeholder: CSSProperties = {
    position: 'absolute',
    inset: 0,
    display: !loaded || errored ? 'flex' : 'none',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 80,
    color: palette.c1,
    fontFamily: 'VT323, monospace',
    opacity: 0.4,
    textShadow: `0 0 20px ${palette.c1}`,
  };
  const overlay: CSSProperties | undefined = greyed
    ? {
        position: 'absolute',
        inset: 0,
        background: `linear-gradient(180deg, ${palette.c5}cc 0%, ${palette.c5}99 50%, ${palette.c5}ff 100%)`,
        pointerEvents: 'none',
      }
    : undefined;
  const initial = CITIES[cityId]?.name?.[0] ?? '?';

  return (
    <div style={wrap}>
      <img src={url} alt="" style={img}
        onLoad={() => setLoaded(true)}
        onError={() => setErrored(true)} />
      <div style={placeholder}>{initial}</div>
      {overlay && <div style={overlay} />}
    </div>
  );
}

/**
 * Background variant — fixed inside its parent, behind content. Used to put
 * a greyed city image as the backdrop for the town-view content. The parent
 * must have position:relative.
 */
export function CityBackdrop({ cityId }: { cityId: string }) {
  const palette = CITY_PALETTES[cityId] ?? DEFAULT_CITY_PALETTE;
  return (
    <div style={{
      position: 'absolute',
      inset: 0,
      zIndex: 0,
      overflow: 'hidden',
      pointerEvents: 'none',
      background: palette.c5,
    }}>
      <CityFull cityId={cityId} greyed style={{
        width: '100%',
        height: '100%',
        aspectRatio: undefined,
        border: 'none',
        opacity: 0.6,
      }} />
    </div>
  );
}
