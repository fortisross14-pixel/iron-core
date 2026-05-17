import { CSSProperties, ReactNode } from 'react';
import { theme } from '../styles/theme';

interface Props {
  children: ReactNode;
  accent?: string;       // border / glow color override
  onClick?: () => void;
  style?: CSSProperties;
}

export function Card({ children, accent, onClick, style }: Props) {
  const c = accent ?? theme.color.borderStrong;

  return (
    <div
      className="ic-worn-surface"
      onClick={onClick}
      style={{
        position: 'relative',
        overflow: 'hidden',
        background: `
          linear-gradient(145deg, rgba(255,255,255,0.035) 0%, transparent 18%),
          radial-gradient(circle at 0% 0%, ${c}26 0%, transparent 38%),
          linear-gradient(180deg, #111114 0%, #08080a 100%)
        `,
        border: `2px solid ${theme.color.ink}`,
        outline: `1px solid ${c}90`,
        padding: theme.space.lg,
        boxShadow: accent
          ? `0 0 18px ${accent}28, inset 0 0 0 1px rgba(255,255,255,0.045), inset 0 -18px 36px rgba(0,0,0,0.45)`
          : `inset 0 0 0 1px rgba(255,255,255,0.035), inset 0 -18px 36px rgba(0,0,0,0.45)`,
        cursor: onClick ? 'pointer' : 'default',
        transition: 'transform 0.08s ease, box-shadow 0.15s ease, outline-color 0.15s ease',
        clipPath: 'polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))',
        ...style,
      }}>
      <span style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: 46,
        height: 6,
        color: accent ?? theme.color.cardYellow,
        opacity: 0.8,
        pointerEvents: 'none',
        background: `repeating-linear-gradient(135deg, currentColor 0 7px, transparent 7px 12px)`,
        zIndex: 3,
      }} />
      <div className="ic-content-above-grime">{children}</div>
    </div>
  );
}
