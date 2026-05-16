import { CSSProperties } from 'react';
import { theme } from '../styles/theme';

interface Props {
  label: string;
  value: number | string;
  accent?: string;
}

export function StatBlock({ label, value, accent = theme.color.accent }: Props) {
  return (
    <div style={{ ...blockStyle, borderLeft: `2px solid ${accent}` }}>
      <div style={labelStyle}>{label}</div>
      <div style={valueStyle}>{value}</div>
    </div>
  );
}

const blockStyle: CSSProperties = {
  background: theme.color.panel,
  padding: '8px 6px',
};

const labelStyle: CSSProperties = {
  fontFamily: theme.font.mono,
  fontSize: theme.size.micro,
  color: theme.color.textDim,
  letterSpacing: theme.letter.normal,
};

const valueStyle: CSSProperties = {
  fontFamily: theme.font.mono,
  fontSize: theme.size.h3,
  color: '#fff',
  fontWeight: 800,
};
