/**
 * BottomNav — top-level tabs for the main game flow.
 *
 * Visible when:
 *   - Player has completed initial naming (has at least 1 bot)
 *   - Not in combat / setup / postfight / dialog
 *
 * Tabs:
 *   TOWN     → world map (current city's locations)
 *   STABLE   → roster + collection
 *   RANKING  → trainer leaderboard
 */

import { CSSProperties } from 'react';
import { useGame } from '../state/GameStore';
import { theme } from '../styles/theme';
import type { Scene } from '../state/types';

const TABS: { scene: Scene; label: string; icon: string }[] = [
  { scene: 'town',    label: 'TOWN',    icon: '◯' },
  { scene: 'stable',  label: 'STABLE',  icon: '◆' },
  { scene: 'ranking', label: 'RANKING', icon: '◇' },
  { scene: 'medals',  label: 'MEDALS',  icon: '✦' },
];

const HIDE_ON: Scene[] = ['intro', 'naming', 'faction_pick', 'combat', 'battleSetup', 'postfight', 'assignItem'];

export function BottomNav() {
  const { state, dispatch } = useGame();
  if (HIDE_ON.includes(state.scene)) return null;
  if (state.bots.length === 0) return null;     // hide until uncle gives starter
  if (state.dialogStack.length > 0) return null; // hide during dialog

  return (
    <nav style={navStyle}>
      {TABS.map(t => {
        const active = state.scene === t.scene;
        return (
          <button key={t.scene} onClick={() => dispatch({ type: 'GO_SCENE', scene: t.scene })}
            style={{ ...tabBtnStyle, ...(active ? activeBtnStyle : {}) }}>
            <span style={iconStyle}>{t.icon}</span>
            <span style={labelStyle}>{t.label}</span>
          </button>
        );
      })}
    </nav>
  );
}

const navStyle: CSSProperties = {
  position: 'fixed',
  bottom: 0,
  left: '50%',
  transform: 'translateX(-50%)',
  width: '100%',
  maxWidth: theme.maxWidth,
  display: 'flex',
  background: theme.color.bgRaised,
  borderTop: `1px solid ${theme.color.accent}4d`,
  zIndex: theme.z.tabs,
};

const tabBtnStyle: CSSProperties = {
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: 2,
  padding: '10px 4px',
  background: 'transparent',
  border: 'none',
  color: theme.color.textMuted,
  cursor: 'pointer',
  borderTop: '2px solid transparent',
};

const activeBtnStyle: CSSProperties = {
  color: theme.color.accent,
  borderTop: `2px solid ${theme.color.accent}`,
};

const iconStyle: CSSProperties = {
  fontSize: 16,
  fontFamily: theme.font.display,
};

const labelStyle: CSSProperties = {
  fontFamily: theme.font.mono,
  fontSize: theme.size.micro,
  letterSpacing: theme.letter.wide,
};
