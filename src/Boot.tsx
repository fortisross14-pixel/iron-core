/**
 * Boot — top-level wrapper that decides which save slot to start with.
 *
 * Always shows the 3-slot picker on startup. Each slot can be:
 *   - EMPTY → button reads "NEW GAME"
 *   - OCCUPIED → button reads "CONTINUE" with summary (trainer name, fame, last-saved time)
 *     A small DELETE button appears next to occupied slots so the player can free them up.
 *
 * Once a slot is picked, that slot is the active autosave destination for the rest
 * of the session. To switch slots, the player has to refresh the page.
 */

import { CSSProperties, useState } from 'react';
import { readAllSummaries, readSave, deleteSave, SaveSlot, SaveSummary } from './state/saveLoad';
import { GameStore } from './state/GameStore';
import { CityPaletteProvider } from './styles/cityPalette';
import { App } from './App';
import { theme } from './styles/theme';
import type { GameState } from './state/types';

export function Boot() {
  const [started, setStarted] = useState(false);
  const [activeSlot, setActiveSlot] = useState<SaveSlot>(1);
  const [bootState, setBootState] = useState<GameState | undefined>(undefined);
  // Force re-render after a delete so summaries refresh
  const [refreshTick, setRefreshTick] = useState(0);

  if (started) {
    return (
      <GameStore bootState={bootState} activeSlot={activeSlot}>
        <CityPaletteProvider>
          <App />
        </CityPaletteProvider>
      </GameStore>
    );
  }

  const summaries = readAllSummaries();

  const startNew = (slot: SaveSlot) => {
    deleteSave(slot);
    setActiveSlot(slot);
    setBootState(undefined);
    setStarted(true);
  };

  const startContinue = (slot: SaveSlot) => {
    const loaded = readSave(slot);
    setActiveSlot(slot);
    setBootState(loaded ?? undefined);
    setStarted(true);
  };

  const handleSlot = (slot: SaveSlot, summary: SaveSummary | null) => {
    if (summary) {
      startContinue(slot);
    } else {
      // Slot is empty — confirm new game
      if (confirm(`Start a new game in slot ${slot}?`)) {
        startNew(slot);
      }
    }
  };

  const handleDelete = (slot: SaveSlot, summary: SaveSummary) => {
    if (confirm(`Permanently delete save in slot ${slot} (${summary.playerName})?\n\nThis cannot be undone.`)) {
      deleteSave(slot);
      setRefreshTick(t => t + 1);
    }
  };

  const handleNewOverwrite = (slot: SaveSlot, summary: SaveSummary) => {
    if (confirm(`Start a NEW GAME in slot ${slot}? This permanently overwrites the current save (${summary.playerName}).`)) {
      startNew(slot);
    }
  };

  return (
    <div style={wrapperStyle} key={refreshTick}>
      <div style={panelStyle}>
        <span style={cornerStyle('top', 'left')} />
        <span style={cornerStyle('top', 'right')} />
        <span style={cornerStyle('bottom', 'left')} />
        <span style={cornerStyle('bottom', 'right')} />

        <div style={brandStyle}>IRON CORE</div>
        <div style={subStyle}>SELECT SAVE SLOT</div>

        {summaries.map((summary, i) => {
          const slot = (i + 1) as SaveSlot;
          return (
            <SlotRow
              key={slot}
              slot={slot}
              summary={summary}
              onPrimary={() => handleSlot(slot, summary)}
              onDelete={summary ? () => handleDelete(slot, summary) : undefined}
              onNewOverwrite={summary ? () => handleNewOverwrite(slot, summary) : undefined}
            />
          );
        })}

        <div style={hintStyle}>
          Each slot is an independent save. The game auto-saves to the slot you choose.
        </div>
      </div>
    </div>
  );
}

function SlotRow({ slot, summary, onPrimary, onDelete, onNewOverwrite }: {
  slot: SaveSlot;
  summary: SaveSummary | null;
  onPrimary: () => void;
  onDelete?: () => void;
  onNewOverwrite?: () => void;
}) {
  const occupied = summary !== null;
  const formatDate = (ts: number) => {
    const diffMs = Date.now() - ts;
    const diffMin = Math.floor(diffMs / 60000);
    if (diffMin < 1) return 'just now';
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHr = Math.floor(diffMin / 60);
    if (diffHr < 24) return `${diffHr}h ago`;
    const diffDay = Math.floor(diffHr / 24);
    if (diffDay < 30) return `${diffDay}d ago`;
    return new Date(ts).toLocaleDateString();
  };

  return (
    <div style={slotWrapStyle(occupied)}>
      <button style={slotMainBtnStyle(occupied)} onClick={onPrimary}>
        <div style={slotLabelRowStyle}>
          <span style={slotNumStyle(occupied)}>SLOT {slot}</span>
          {occupied ? (
            <span style={slotActionLabelStyle(occupied)}>CONTINUE →</span>
          ) : (
            <span style={slotActionLabelStyle(occupied)}>NEW GAME →</span>
          )}
        </div>
        {occupied && summary ? (
          <div style={slotBodyStyle}>
            <div style={slotBodyRowStyle}>
              <span style={slotBodyLblStyle}>TRAINER</span>
              <span style={slotBodyValStyle}>{summary.playerName}</span>
            </div>
            <div style={slotBodyRowStyle}>
              <span style={slotBodyLblStyle}>FAME</span>
              <span style={slotBodyValStyle}>{summary.fame.toLocaleString()}</span>
            </div>
            <div style={slotBodyRowStyle}>
              <span style={slotBodyLblStyle}>ROSTER</span>
              <span style={slotBodyValStyle}>{summary.bots}</span>
            </div>
            <div style={slotBodyRowStyle}>
              <span style={slotBodyLblStyle}>LAST SAVED</span>
              <span style={slotBodyValStyle}>{formatDate(summary.savedAt)}</span>
            </div>
          </div>
        ) : (
          <div style={slotEmptyStyle}>— empty —</div>
        )}
      </button>
      {occupied && (
        <div style={slotSecondaryRowStyle}>
          {onNewOverwrite && (
            <button style={smallBtnStyle} onClick={onNewOverwrite}>
              ↻ NEW
            </button>
          )}
          {onDelete && (
            <button style={smallBtnDangerStyle} onClick={onDelete}>
              ✕ DELETE
            </button>
          )}
        </div>
      )}
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
  alignItems: 'flex-start',
  justifyContent: 'center',
  padding: 20,
  color: theme.color.text,
};

const panelStyle: CSSProperties = {
  width: '100%',
  maxWidth: 420,
  background: theme.color.bgRaised,
  border: `1px solid ${theme.color.accent}`,
  padding: '28px 22px',
  position: 'relative',
  boxShadow: `0 0 32px ${theme.color.accent}40`,
  marginTop: 20,
};

const cornerStyle = (v: 'top' | 'bottom', h: 'left' | 'right', size = 14): CSSProperties => ({
  position: 'absolute',
  width: size, height: size,
  [v]: -1,
  [h]: -1,
  [v === 'top' ? 'borderTop' : 'borderBottom']: `2px solid ${theme.color.accent}`,
  [h === 'left' ? 'borderLeft' : 'borderRight']: `2px solid ${theme.color.accent}`,
  pointerEvents: 'none',
} as CSSProperties);

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
  marginBottom: 20,
};

const slotWrapStyle = (occupied: boolean): CSSProperties => ({
  marginBottom: 12,
  border: `1px solid ${occupied ? theme.color.border : theme.color.border}80`,
  background: occupied ? theme.color.bgSunken : 'rgba(255,255,255,0.02)',
});

const slotMainBtnStyle = (occupied: boolean): CSSProperties => ({
  width: '100%',
  padding: occupied ? '14px 14px 10px' : '20px 14px',
  background: 'transparent',
  border: 'none',
  color: theme.color.text,
  textAlign: 'left',
  cursor: 'pointer',
  display: 'flex',
  flexDirection: 'column',
  gap: 10,
});

const slotLabelRowStyle: CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'baseline',
};

const slotNumStyle = (occupied: boolean): CSSProperties => ({
  fontFamily: theme.font.display,
  fontSize: 14,
  letterSpacing: 2,
  color: occupied ? '#fff' : theme.color.textMuted,
});

const slotActionLabelStyle = (occupied: boolean): CSSProperties => ({
  fontFamily: theme.font.mono,
  fontSize: 10,
  letterSpacing: 2,
  color: occupied ? theme.color.accent : theme.color.textDim,
});

const slotBodyStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 4,
};

const slotBodyRowStyle: CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'baseline',
};

const slotBodyLblStyle: CSSProperties = {
  fontFamily: theme.font.mono,
  fontSize: 9,
  color: theme.color.textDim,
  letterSpacing: 1.2,
};

const slotBodyValStyle: CSSProperties = {
  fontFamily: theme.font.display,
  fontSize: 12,
  color: '#fff',
  letterSpacing: 0.5,
};

const slotEmptyStyle: CSSProperties = {
  fontFamily: theme.font.mono,
  fontSize: 10,
  color: theme.color.textDim,
  fontStyle: 'italic',
  letterSpacing: 1,
};

const slotSecondaryRowStyle: CSSProperties = {
  display: 'flex',
  gap: 0,
  borderTop: `1px solid ${theme.color.border}`,
};

const smallBtnStyle: CSSProperties = {
  flex: 1,
  padding: '7px 8px',
  background: 'transparent',
  border: 'none',
  color: theme.color.textMuted,
  fontFamily: theme.font.mono,
  fontSize: 10,
  letterSpacing: 1.5,
  cursor: 'pointer',
};

const smallBtnDangerStyle: CSSProperties = {
  ...smallBtnStyle,
  color: theme.color.danger,
  borderLeft: `1px solid ${theme.color.border}`,
};

const hintStyle: CSSProperties = {
  marginTop: 16,
  fontFamily: theme.font.body,
  fontStyle: 'italic',
  fontSize: 11,
  color: theme.color.textDim,
  textAlign: 'center',
  lineHeight: 1.5,
};
