import { CSSProperties, ReactNode } from 'react';
import { theme } from '../styles/theme';

interface Props {
  children: ReactNode;
  accent?: string;       // border / glow color override
  onClick?: () => void;
  style?: CSSProperties;
}

export function Card({ children, accent, onClick, style }: Props) {
  return (
    <div
      onClick={onClick}
      style={{
        background: theme.color.bgRaised,
        border: `1px solid ${accent ?? theme.color.border}`,
        padding: theme.space.lg,
        boxShadow: accent ? `0 0 14px ${accent}30` : 'none',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all 0.15s',
        ...style,
      }}>
      {children}
    </div>
  );
}
