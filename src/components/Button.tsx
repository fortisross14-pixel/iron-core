import { CSSProperties, ReactNode } from 'react';
import { theme } from '../styles/theme';

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
  const base = baseStyle(variant, disabled, full, small);
  return (
    <button onClick={onClick} disabled={disabled} style={{ ...base, ...style }}>
      {children}
    </button>
  );
}

function baseStyle(v: Variant, disabled: boolean | undefined, full: boolean | undefined, small: boolean | undefined): CSSProperties {
  const pad = small ? '8px 12px' : '14px 22px';
  const fs = small ? theme.size.small : theme.size.h3;
  const palette: Record<Variant, { bg: string; color: string; border: string }> = {
    primary:   { bg: theme.color.accent, color: '#0a0a0c',           border: 'none' },
    secondary: { bg: 'transparent',      color: theme.color.accent,  border: `1px solid ${theme.color.accent}` },
    ghost:     { bg: 'transparent',      color: theme.color.textMuted, border: `1px solid ${theme.color.borderStrong}` },
    danger:    { bg: 'transparent',      color: theme.color.danger,  border: `1px solid ${theme.color.danger}` },
  };
  const p = palette[v];
  return {
    background: disabled ? theme.color.panel : p.bg,
    color: disabled ? theme.color.textVeryDim : p.color,
    border: disabled ? `1px solid ${theme.color.border}` : p.border,
    padding: pad,
    fontFamily: theme.font.display,
    fontSize: fs,
    letterSpacing: theme.letter.wider,
    width: full ? '100%' : undefined,
    boxShadow: v === 'primary' && !disabled ? `0 0 18px ${theme.color.accentDim}` : 'none',
  };
}
