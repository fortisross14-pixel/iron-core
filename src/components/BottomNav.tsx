/**
 * BottomNav — top-level tabs.
 *
 * Active tab gets:
 *   - Filled c5 background tint
 *   - c1 top accent bar with c2 glow
 *   - c1 icon + label
 *   - Notch corner cuts (top-right + top-left)
 *
 * Inactive tabs are transparent with c4 text.
 */

import { CSSProperties } from 'react';
import { useGame } from '../state/GameStore';
import { theme } from '../styles/theme';
import { useCityPalette } from '../styles/cityPalette';
import type { Scene } from '../state/types';

const TABS: { scene: Scene; label: string; icon: string }[] = [
  { scene: 'me',      label: 'ME',      icon: '⏃' },
  { scene: 'town',    label: 'MAP',     icon: '◯' },
  { scene: 'stable',  label: 'STABLE',  icon: '◆' },
  { scene: 'ranking', label: 'RANK',    icon: '◇' },
  { scene: 'medals',  label: 'MEDALS',  icon: '✦' },
];

const HIDE_ON: Scene[] = ['intro', 'naming', 'faction_pick', 'combat', 'battleSetup', 'postfight', 'assignItem', 'learnMove', 'captureChoice'];

export function BottomNav() {
  const { state, dispatch } = useGame();
  const palette = useCityPalette();

  if (HIDE_ON.includes(state.scene)) return null;
  if (state.bots.length === 0) return null;
  if (state.dialogStack.length > 0) return null;

  const navStyle: CSSProperties = {
    position: 'fixed',
    bottom: 0,
    left: '50%',
    transform: 'translateX(-50%)',
    width: '100%',
    maxWidth: theme.maxWidth,
    display: 'flex',
    background: `linear-gradient(180deg, ${theme.color.bgRaised} 0%, ${palette.c5}80 100%)`,
    borderTop: `1px solid ${palette.c1}80`,
    zIndex: theme.z.tabs,
  };

  return (
    <nav style={navStyle}>
      {TABS.map(t => {
        const active = state.scene === t.scene;
        const tabBtnStyle: CSSProperties = {
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 2,
          padding: '10px 4px 8px',
          background: active ? `${palette.c5}80` : 'transparent',
          border: 'none',
          color: active ? palette.c1 : palette.c4,
          cursor: 'pointer',
          borderTop: active ? `2px solid ${palette.c1}` : `2px solid transparent`,
          position: 'relative',
          fontFamily: theme.font.mono,
          textShadow: active ? `0 0 8px ${palette.c1}80` : 'none',
        };

        return (
          <button key={t.scene} onClick={() => dispatch({ type: 'GO_SCENE', scene: t.scene })} style={tabBtnStyle}>
            <span style={{ fontSize: 16, fontFamily: theme.font.display }}>{t.icon}</span>
            <span style={{ fontFamily: theme.font.mono, fontSize: theme.size.micro, letterSpacing: theme.letter.wide }}>
              {t.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
