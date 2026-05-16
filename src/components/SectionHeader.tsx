import { CSSProperties, ReactNode } from 'react';
import { theme } from '../styles/theme';

export function SectionHeader({ children }: { children: ReactNode }) {
  return <div style={sectionStyle}>{children}</div>;
}

export function SubHeader({ children }: { children: ReactNode }) {
  return <div style={subStyle}>{children}</div>;
}

const sectionStyle: CSSProperties = {
  fontFamily: theme.font.display,
  fontSize: 14,
  letterSpacing: theme.letter.wide,
  color: theme.color.textMuted,
  paddingTop: 8,
  paddingBottom: 4,
  borderBottom: `1px solid ${theme.color.border}`,
  marginBottom: 6,
};

const subStyle: CSSProperties = {
  fontFamily: theme.font.mono,
  fontSize: theme.size.tiny,
  color: theme.color.accent,
  letterSpacing: theme.letter.wide,
  marginTop: 14,
  marginBottom: 6,
};
