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
    padding: pad,
    background: selected ? `${cDeep}b0` : theme.color.bgRaised,
    boxShadow: glow ? `0 0 14px ${c}40, inset 0 0 0 1px ${selected ? c : 'transparent'}` : undefined,
    cursor: onClick ? 'pointer' : undefined,
    opacity: disabled ? 0.4 : 1,
    pointerEvents: disabled ? 'none' : undefined,
    ...style,
  };

  if (variant === 'corner') {
    return (
      <div style={baseStyle} onClick={onClick}>
        <CornerMarks color={c} />
        {children}
      </div>
    );
  }

  if (variant === 'notched') {
    // Cut-corner border via clip-path
    const clip = 'polygon(8px 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%, 0 8px)';
    return (
      <div style={{ ...baseStyle, clipPath: clip, border: `1px solid ${cDim}` }} onClick={onClick}>
        <CornerMarks color={c} />
        {children}
      </div>
    );
  }

  if (variant === 'band') {
    return (
      <div style={{ ...baseStyle, borderTop: `2px solid ${c}`, borderBottom: `1px solid ${cDim}` }} onClick={onClick}>
        {children}
      </div>
    );
  }

  // edge
  return (
    <div style={{ ...baseStyle, borderTop: `1px solid ${c}`, borderBottom: `1px solid ${cDim}40` }} onClick={onClick}>
      {children}
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
