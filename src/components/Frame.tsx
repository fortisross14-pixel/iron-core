/**
 * Frame — the signature visual element.
 *
 * Four variants:
 *   - 'corner'    : minimal — 4 L-shape bracket corners only (lightweight)
 *   - 'notched'   : heavy — 4 corners + cut-corner outline (full frame)
 *   - 'band'      : top edge band + side rules (panel-style header)
 *   - 'edge'      : just a top edge accent + bottom rule (list section divider)
 *
 * All variants pull color from the active city palette unless `color` override
 * is provided.
 *
 * Usage:
 *   <Frame variant="corner"><div>content</div></Frame>
 *   <Frame variant="notched" glow><div>content</div></Frame>
 */

import { CSSProperties, ReactNode } from 'react';
import { useCityPalette } from '../styles/cityPalette';
import { theme } from '../styles/theme';

type Variant = 'corner' | 'notched' | 'band' | 'edge';

export function Frame({
  variant = 'corner',
  color,
  glow = false,
  selected = false,
  padding = 'md',
  children,
  style,
  onClick,
  disabled,
}: {
  variant?: Variant;
  color?: string;
  glow?: boolean;
  selected?: boolean;
  padding?: keyof typeof theme.space | 'none';
  children: ReactNode;
  style?: CSSProperties;
  onClick?: () => void;
  disabled?: boolean;
}) {
  const palette = useCityPalette();
  const c = color ?? palette.c1;
  const cDim = color ?? palette.c4;
  const cDeep = color ?? palette.c5;

  const pad = padding === 'none' ? 0 : theme.space[padding];

  const baseStyle: CSSProperties = {
    position: 'relative',
    overflow: 'hidden',
    padding: pad,
    background: selected
      ? `linear-gradient(180deg, ${cDeep}d0 0%, ${theme.color.bgRaised} 100%)`
      : `linear-gradient(180deg, ${theme.color.bgRaised} 0%, ${theme.color.bgSunken} 100%)`,
    border: `1px solid ${theme.color.ink}`,
    outline: selected ? `1px solid ${c}` : `1px solid ${cDim}80`,
    boxShadow: glow
      ? `0 0 18px ${c}38, inset 0 0 0 1px rgba(255,255,255,0.04), inset 0 -18px 36px rgba(0,0,0,0.42)`
      : `inset 0 0 0 1px rgba(255,255,255,0.03), inset 0 -12px 28px rgba(0,0,0,0.34)`,
    cursor: onClick ? 'pointer' : undefined,
    opacity: disabled ? 0.4 : 1,
    pointerEvents: disabled ? 'none' : undefined,
    ...style,
  };

  if (variant === 'corner') {
    return (
      <div className="ic-worn-surface" style={baseStyle} onClick={onClick}>
        <CornerMarks color={c} />
        <div className="ic-content-above-grime">{children}</div>
      </div>
    );
  }

  if (variant === 'notched') {
    // Cut-corner border via clip-path
    const clip = 'polygon(8px 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%, 0 8px)';
    return (
      <div className="ic-worn-surface" style={{ ...baseStyle, clipPath: clip, border: `2px solid ${theme.color.ink}`, outline: `1px solid ${selected ? c : cDim}` }} onClick={onClick}>
        <CornerMarks color={c} />
        <div style={{ position: 'absolute', top: 0, right: 0, width: 54, height: 8, color: c, opacity: 0.7, background: 'repeating-linear-gradient(135deg, currentColor 0 7px, transparent 7px 12px)', pointerEvents: 'none', zIndex: 3 }} />
        <div className="ic-content-above-grime">{children}</div>
      </div>
    );
  }

  if (variant === 'band') {
    return (
      <div className="ic-worn-surface" style={{ ...baseStyle, borderTop: `3px solid ${c}`, borderBottom: `1px solid ${cDim}` }} onClick={onClick}>
        <div className="ic-content-above-grime">{children}</div>
      </div>
    );
  }

  // edge
  return (
    <div className="ic-worn-surface" style={{ ...baseStyle, borderTop: `2px solid ${c}`, borderBottom: `1px solid ${cDim}40` }} onClick={onClick}>
      <div className="ic-content-above-grime">{children}</div>
    </div>
  );
}

/** Four L-shape bracket corner marks, positioned absolutely. */
function CornerMarks({ color, size = 10, thickness = 2 }: { color: string; size?: number; thickness?: number }) {
  const common: CSSProperties = {
    position: 'absolute',
    width: size,
    height: size,
    pointerEvents: 'none',
  };
  return (
    <>
      <span style={{ ...common, top: -1, left: -1, borderTop: `${thickness}px solid ${color}`, borderLeft: `${thickness}px solid ${color}` }} />
      <span style={{ ...common, top: -1, right: -1, borderTop: `${thickness}px solid ${color}`, borderRight: `${thickness}px solid ${color}` }} />
      <span style={{ ...common, bottom: -1, left: -1, borderBottom: `${thickness}px solid ${color}`, borderLeft: `${thickness}px solid ${color}` }} />
      <span style={{ ...common, bottom: -1, right: -1, borderBottom: `${thickness}px solid ${color}`, borderRight: `${thickness}px solid ${color}` }} />
    </>
  );
}

/** A bracketed label like [ STABLE · ROSTER ].
 *  Used as a section title throughout the UI. */
export function BracketLabel({ children, color, style }: { children: ReactNode; color?: string; style?: CSSProperties }) {
  const palette = useCityPalette();
  const c = color ?? palette.c1;
  const wrapStyle: CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    fontFamily: theme.font.mono,
    fontSize: theme.size.tiny,
    letterSpacing: theme.letter.wide,
    color: c,
    ...style,
  };
  const bracketStyle: CSSProperties = { color: c, fontWeight: 800 };
  return (
    <span style={wrapStyle}>
      <span style={bracketStyle}>[</span>
      <span>{children}</span>
      <span style={bracketStyle}>]</span>
    </span>
  );
}

/** A connection-id metadata stamp ("CONNECTION 541.84.45").
 *  Generates a stable pseudo-random id from a seed string. */
export function ConnectionStamp({ seed = 'iron', color }: { seed?: string; color?: string }) {
  const palette = useCityPalette();
  const c = color ?? palette.c3;
  // Stable hash: produce a XXX.XX.XX format
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) | 0;
  const a = (Math.abs(h) % 900) + 100;
  const b = (Math.abs(h >> 8) % 90) + 10;
  const d = (Math.abs(h >> 16) % 90) + 10;
  return (
    <span style={{
      fontFamily: theme.font.mono,
      fontSize: theme.size.micro,
      letterSpacing: theme.letter.tight,
      color: c,
    }}>
      CONNECTION {a}.{b}.{d}
    </span>
  );
}

/** A thin tapering edge band — a horizontal line that fades to transparent.
 *  Useful for section dividers and card edges. */
export function EdgeBand({ color, height = 2 }: { color?: string; height?: number }) {
  const palette = useCityPalette();
  const c = color ?? palette.c2;
  return (
    <div style={{
      height,
      background: `linear-gradient(90deg, ${c} 0%, ${c} 60%, transparent 100%)`,
      pointerEvents: 'none',
    }} />
  );
}
