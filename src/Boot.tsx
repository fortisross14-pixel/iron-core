/**
 * Boot — top-level wrapper that decides how to start the app.
 *
 * If a save exists, shows a chooser screen: CONTINUE or NEW GAME.
 * If no save exists (or the player picks NEW), mounts GameStore with the
 * default initialState.
 * If the player picks CONTINUE, mounts GameStore with the loaded state.
 *
 * This sits ABOVE the GameStore — once you commit to a mode, the rest of the
 * app runs normally and autosave takes over.
 */

import { CSSProperties, useState } from 'react';
import { hasSave, readSave, readSaveSummary, deleteSave } from './state/saveLoad';
import { GameStore } from './state/GameStore';
import { CityPaletteProvider } from './styles/cityPalette';
import { App } from './App';
import { theme } from './styles/theme';
import type { GameState } from './state/types';

export function Boot() {
  const [mode, setMode] = useState<'choosing' | 'started'>(() =>
    hasSave() ? 'choosing' : 'started'
  );
  const [bootState, setBootState] = useState<GameState | undefined>(undefined);

  if (mode === 'started') {
    return (
      <GameStore bootState={bootState}>
        <CityPaletteProvider>
          <App />
        </CityPaletteProvider>
      </GameStore>
    );
  }

  // CHOOSING — render the save-or-new screen
  const summary = readSaveSummary();
  const formatDate = (ts: number) => {
    const d = new Date(ts);
    const diffMs = Date.now() - ts;
    const diffMin = Math.floor(diffMs / 60000);
    if (diffMin < 1) return 'just now';
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHr = Math.floor(diffMin / 60);
    if (diffHr < 24) return `${diffHr}h ago`;
    const diffDay = Math.floor(diffHr / 24);
    if (diffDay < 30) return `${diffDay}d ago`;
    return d.toLocaleDateString();
  };

  return (
    <div style={wrapperStyle}>
      <div style={panelStyle}>
        <div style={cornerTL} /><div style={cornerTR} />
        <div style={cornerBL} /><div style={cornerBR} />

        <div style={brandStyle}>IRON CORE</div>
        <div style={subStyle}>SAVE FOUND</div>

        {summary && (
          <div style={summaryStyle}>
            <div style={summaryRowStyle}>
              <span style={summaryLblStyle}>TRAINER</span>
              <span style={summaryValStyle}>{summary.playerName}</span>
            </div>
            <div style={summaryRowStyle}>
              <span style={summaryLblStyle}>FAME</span>
              <span style={summaryValStyle}>{summary.fame.toLocaleString()}</span>
            </div>
            <div style={summaryRowStyle}>
              <span style={summaryLblStyle}>ROSTER</span>
              <span style={summaryValStyle}>{summary.bots}</span>
            </div>
            <div style={summaryRowStyle}>
              <span style={summaryLblStyle}>LAST SAVED</span>
              <span style={summaryValStyle}>{formatDate(summary.savedAt)}</span>
            </div>
          </div>
        )}

        <button
          style={primaryBtnStyle}
          onClick={() => {
            const loaded = readSave();
            if (loaded) {
              setBootState(loaded);
            }
            setMode('started');
          }}>
          CONTINUE →
        </button>

        <button
          style={secondaryBtnStyle}
          onClick={() => {
            if (confirm('Start a NEW GAME? Your current save will be permanently overwritten.')) {
              deleteSave();
              setBootState(undefined);
              setMode('started');
            }
          }}>
          NEW GAME
        </button>
      </div>
    </div>
  );
}

// ============================================================
// Styles
// ============================================================

const wrapperStyle: CSSProperties = {
  minHeight: '100vh',
  background: `radial-gradient(ellipse at top, #1a1208 0%, #050507 60%, #000 100%)`,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: 20,
  color: theme.color.text,
};

const panelStyle: CSSProperties = {
  width: '100%',
  maxWidth: 380,
  background: theme.color.bgRaised,
  border: `1px solid ${theme.color.accent}`,
  padding: '32px 24px',
  position: 'relative',
  boxShadow: `0 0 32px ${theme.color.accent}40`,
};

const cornerBase: CSSProperties = {
  position: 'absolute',
  width: 14,
  height: 14,
  pointerEvents: 'none',
};
const cornerTL = { ...cornerBase, top: -1, left: -1, borderTop: `2px solid ${theme.color.accent}`, borderLeft: `2px solid ${theme.color.accent}` };
const cornerTR = { ...cornerBase, top: -1, right: -1, borderTop: `2px solid ${theme.color.accent}`, borderRight: `2px solid ${theme.color.accent}` };
const cornerBL = { ...cornerBase, bottom: -1, left: -1, borderBottom: `2px solid ${theme.color.accent}`, borderLeft: `2px solid ${theme.color.accent}` };
const cornerBR = { ...cornerBase, bottom: -1, right: -1, borderBottom: `2px solid ${theme.color.accent}`, borderRight: `2px solid ${theme.color.accent}` };

const brandStyle: CSSProperties = {
  fontFamily: theme.font.display,
  fontSize: 32,
  letterSpacing: 4,
  color: '#fff',
  textAlign: 'center',
  textShadow: `0 0 16px ${theme.color.accent}80`,
  marginBottom: 6,
};

const subStyle: CSSProperties = {
  fontFamily: theme.font.mono,
  fontSize: 11,
  letterSpacing: 2,
  color: theme.color.accent,
  textAlign: 'center',
  marginBottom: 24,
};

const summaryStyle: CSSProperties = {
  background: theme.color.bgSunken,
  padding: '12px 16px',
  border: `1px solid ${theme.color.border}`,
  marginBottom: 20,
  display: 'flex',
  flexDirection: 'column',
  gap: 6,
};

const summaryRowStyle: CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'baseline',
};

const summaryLblStyle: CSSProperties = {
  fontFamily: theme.font.mono,
  fontSize: 10,
  color: theme.color.textDim,
  letterSpacing: 1.5,
};

const summaryValStyle: CSSProperties = {
  fontFamily: theme.font.display,
  fontSize: 14,
  color: '#fff',
  letterSpacing: 1,
};

const primaryBtnStyle: CSSProperties = {
  width: '100%',
  padding: '14px',
  background: theme.color.accent,
  border: 'none',
  color: '#000',
  fontFamily: theme.font.display,
  fontSize: 14,
  letterSpacing: 2,
  cursor: 'pointer',
  marginBottom: 8,
  fontWeight: 700,
};

const secondaryBtnStyle: CSSProperties = {
  width: '100%',
  padding: '12px',
  background: 'transparent',
  border: `1px solid ${theme.color.border}`,
  color: theme.color.textMuted,
  fontFamily: theme.font.mono,
  fontSize: 11,
  letterSpacing: 2,
  cursor: 'pointer',
};
