/**
 * Button — city-tinted with cyberpunk treatment.
 *
 * Variants:
 *   - primary:   filled with c1, dark text, glow
 *   - secondary: outlined c1, transparent fill, c1 text
 *   - ghost:     outlined dim, c3 text
 *   - danger:    outlined red, red text
 *
 * Shape: small cut corner top-right + bottom-left for that diagonal cyberpunk vibe.
 */

import { CSSProperties, ReactNode } from 'react';
import { theme } from '../styles/theme';
import { useCityPalette } from '../styles/cityPalette';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';

interface Props {
  onClick?: () => void;
  disabled?: boolean;
  variant?: Variant;
  full?: boolean;
  small?: boolean;
  children: ReactNode;
  style?: CSSProperties;
}

export function Button({
  onClick,
  disabled,
  variant = 'primary',
  full,
  small,
  children,
  style,
}: Props) {
  const palette = useCityPalette();
  const pad = small ? '7px 12px' : '12px 20px';
  const fs = small ? theme.size.small : theme.size.body;

  const colors: Record<Variant, { bg: string; color: string; border: string; glow: string }> = {
    primary:   {
      bg: palette.c1,
      color: theme.color.textBlack,
      border: `1px solid ${palette.c1}`,
      glow: `${palette.c1}80`,
    },
    secondary: {
      bg: `${palette.c5}80`,
      color: palette.c1,
      border: `1px solid ${palette.c1}`,
      glow: 'transparent',
    },
    ghost:     {
      bg: 'transparent',
      color: palette.c3,
      border: `1px solid ${palette.c4}80`,
      glow: 'transparent',
    },
    danger:    {
      bg: 'transparent',
      color: theme.color.danger,
      border: `1px solid ${theme.color.danger}`,
      glow: 'transparent',
    },
  };
  const c = colors[variant];

  // Notch top-right and bottom-left for the cyberpunk shape
  const clip = 'polygon(0 0, calc(100% - 7px) 0, 100% 7px, 100% 100%, 7px 100%, 0 calc(100% - 7px))';

  const base: CSSProperties = {
    position: 'relative',
    background: disabled ? theme.color.panel : c.bg,
    color: disabled ? theme.color.textVeryDim : c.color,
    border: disabled ? `1px solid ${theme.color.border}` : c.border,
    padding: pad,
    fontFamily: theme.font.display,
    fontSize: fs,
    letterSpacing: theme.letter.wider,
    width: full ? '100%' : undefined,
    boxShadow: !disabled && c.glow !== 'transparent' ? `0 0 14px ${c.glow}` : 'none',
    cursor: disabled ? 'not-allowed' : 'pointer',
    transition: 'transform 0.05s, box-shadow 0.15s',
    clipPath: clip,
    textTransform: 'uppercase',
  };

  return (
    <button onClick={onClick} disabled={disabled} style={{ ...base, ...style }}>
      {children}
    </button>
  );
}
