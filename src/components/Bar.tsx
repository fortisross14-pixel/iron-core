import { CSSProperties } from 'react';
import { theme } from '../styles/theme';

interface Props {
  label?: string;
  value: number;
  max: number;
  color?: string;
  meta?: string;
}

export function Bar({ label, value, max, color = theme.color.accent, meta }: Props) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  return (
    <div style={rowStyle}>
      {label !== undefined && <span style={labelStyle}>{label}</span>}
      <div style={trackStyle}>
        <div style={{ ...fillStyle, width: `${pct}%`, background: color }} />
      </div>
      {meta !== undefined && <span style={metaStyle}>{meta}</span>}
    </div>
  );
}

const rowStyle: CSSProperties = { display: 'flex', alignItems: 'center', gap: 8 };

const labelStyle: CSSProperties = {
  fontFamily: theme.font.mono,
  fontSize: theme.size.micro,
  color: theme.color.textDim,
  width: 28,
  letterSpacing: theme.letter.normal,
};

const trackStyle: CSSProperties = {
  flex: 1,
  height: 4,
  background: theme.color.panel,
  borderRadius: 2,
  overflow: 'hidden',
};

const fillStyle: CSSProperties = {
  height: '100%',
  transition: 'width 0.4s',
};

const metaStyle: CSSProperties = {
  fontFamily: theme.font.mono,
  fontSize: theme.size.micro,
  color: theme.color.textMuted,
  minWidth: 90,
  textAlign: 'right',
};
