/**
 * MeScreen — player profile summary tab.
 *
 * Single screen, no sub-tabs. Shows the player's stats at a glance:
 *   - Name (editable inline)
 *   - Faction (with faction color)
 *   - Tier badge
 *   - Stats grid: fame, credits, mechas owned/discovered, battles won/lost,
 *     tournaments won, captures, etc.
 *   - Crew bonuses summary
 *   - Story progress (flags raised)
 *
 * No game actions — purely a readout.
 */

import { CSSProperties, useState } from 'react';
import { useGame } from '../state/GameStore';
import { Shell } from '../components/Shell';
import { useCityPalette } from '../styles/cityPalette';
import { BracketLabel, EdgeBand } from '../components/Frame';
import { theme } from '../styles/theme';
import { FACTIONS } from '../data/factions';
import { TOTAL_DEX } from '../data/models';
import { TIER_LABEL, TIER_COLOR } from '../game/tier';
import { calcMentorBonuses } from '../game/stats';

export function MeScreen() {
  const { state, dispatch } = useGame();
  const palette = useCityPalette();
  const [editingName, setEditingName] = useState(false);
  const [nameDraft, setNameDraft] = useState(state.playerName);

  const faction = state.factionId ? FACTIONS[state.factionId] : null;
  const factionColor = faction ? theme.factionColor[faction.id] : palette.c1;

  // Stats
  const totalWins = state.bots.reduce((s, b) => s + b.wins, 0);
  const totalLosses = state.bots.reduce((s, b) => s + b.losses, 0);
  const totalBattles = state.achievements.totalBattles;
  const tournamentsWon = Object.values(state.championWins).reduce((a, b) => a + b, 0);
  const mechasOwned = state.bots.length;
  const mechasInCrew = state.crew.length;
  const mechasDiscovered = state.discovered.size;
  const captures = state.achievements.junkyardWins;
  const totalAttacks = state.bots.reduce((s, b) => s + b.wins + b.losses, 0);
  const winRate = totalAttacks > 0 ? Math.round((totalWins / totalAttacks) * 100) : 0;

  const crewBonus = calcMentorBonuses(state.crew);

  const saveName = () => {
    if (nameDraft.trim()) {
      dispatch({ type: 'SET_PLAYER_NAME', name: nameDraft });
    }
    setEditingName(false);
  };

  return (
    <Shell pageLabel="ME">
      <div style={{ marginBottom: theme.space.xs }}>
        <BracketLabel>TRAINER PROFILE</BracketLabel>
      </div>
      <div style={titleStyle(palette)}>ME</div>
      <EdgeBand color={palette.c1} />

      {/* IDENTITY CARD */}
      <div style={identityCardStyle(palette)}>
        <span style={cornerStyle(palette.c1, 'top', 'left')} />
        <span style={cornerStyle(palette.c1, 'top', 'right')} />
        <span style={cornerStyle(palette.c1, 'bottom', 'left')} />
        <span style={cornerStyle(palette.c1, 'bottom', 'right')} />

        <div style={identityTopRowStyle}>
          <div style={nameBlockStyle}>
            <div style={labelStyle(palette)}>HANDLE</div>
            {editingName ? (
              <input autoFocus
                value={nameDraft}
                onChange={e => setNameDraft(e.target.value)}
                onBlur={saveName}
                onKeyDown={e => e.key === 'Enter' && saveName()}
                maxLength={20}
                style={nameInputStyle(palette)} />
            ) : (
              <button onClick={() => { setNameDraft(state.playerName); setEditingName(true); }}
                style={nameButtonStyle(palette)}>
                {state.playerName || 'TRAINER'} <span style={editIconStyle(palette)}>✎</span>
              </button>
            )}
          </div>
          <div style={tierBlockStyle}>
            <div style={labelStyle(palette)}>TIER</div>
            <div style={{ ...tierBadgeStyle, color: TIER_COLOR[state.playerTier], borderColor: TIER_COLOR[state.playerTier] }}>
              {TIER_LABEL[state.playerTier]}
            </div>
          </div>
        </div>

        {faction && (
          <div style={factionRowStyle(factionColor)}>
            <span style={factionLabelStyle}>FACTION</span>
            <span style={{ ...factionValueStyle, color: factionColor }}>
              {faction.name.toUpperCase()}
            </span>
          </div>
        )}
      </div>

      {/* STATS GRID */}
      <div style={{ marginTop: theme.space.lg, marginBottom: theme.space.sm }}>
        <BracketLabel>STATISTICS</BracketLabel>
      </div>
      <div style={statGridStyle}>
        <StatCell label="FAME" value={state.fame.toLocaleString()} palette={palette} highlight />
        <StatCell label="CREDITS" value={state.money.toLocaleString()} palette={palette} highlight />
        <StatCell label="TIER" value={TIER_LABEL[state.playerTier]} palette={palette} />
        <StatCell label="TOURNAMENTS" value={String(tournamentsWon)} palette={palette} />

        <StatCell label="WINS" value={String(totalWins)} palette={palette} />
        <StatCell label="LOSSES" value={String(totalLosses)} palette={palette} />
        <StatCell label="WIN RATE" value={`${winRate}%`} palette={palette} />
        <StatCell label="BATTLES" value={String(totalBattles)} palette={palette} />

        <StatCell label="ROSTER" value={`${mechasOwned}/5`} palette={palette} />
        <StatCell label="CREW" value={String(mechasInCrew)} palette={palette} />
        <StatCell label="DEX" value={`${mechasDiscovered}/${TOTAL_DEX}`} palette={palette} />
        <StatCell label="CAPTURES" value={String(captures)} palette={palette} />
      </div>

      {/* CREW SUMMARY */}
      {state.crew.length > 0 && (
        <>
          <div style={{ marginTop: theme.space.lg, marginBottom: theme.space.sm }}>
            <BracketLabel>CREW BONUSES (PASSIVE)</BracketLabel>
          </div>
          <div style={crewBonusRowStyle(palette)}>
            <span style={crewBonusItemStyle}>
              <span style={crewBonusLblStyle(palette)}>ATK</span>
              <span style={crewBonusValStyle(palette)}>+{crewBonus.attack.toFixed(1)}%</span>
            </span>
            <span style={crewBonusItemStyle}>
              <span style={crewBonusLblStyle(palette)}>DEF</span>
              <span style={crewBonusValStyle(palette)}>+{crewBonus.defense.toFixed(1)}%</span>
            </span>
            <span style={crewBonusItemStyle}>
              <span style={crewBonusLblStyle(palette)}>SPD</span>
              <span style={crewBonusValStyle(palette)}>+{crewBonus.speed.toFixed(1)}%</span>
            </span>
          </div>
        </>
      )}

      {/* STORY MILESTONES */}
      {state.storyFlags.size > 0 && (
        <>
          <div style={{ marginTop: theme.space.lg, marginBottom: theme.space.sm }}>
            <BracketLabel>MILESTONES · {state.storyFlags.size}</BracketLabel>
          </div>
          <div style={flagListStyle}>
            {Array.from(state.storyFlags).map(f => (
              <span key={f} style={flagChipStyle(palette)}>
                {f.replace(/_/g, ' ').toUpperCase()}
              </span>
            ))}
          </div>
        </>
      )}
    </Shell>
  );
}

// ============================================================
// StatCell — individual stat block
// ============================================================

function StatCell({ label, value, palette, highlight }: {
  label: string; value: string; palette: { c1: string; c2: string; c3: string; c4: string; c5: string };
  highlight?: boolean;
}) {
  return (
    <div style={{
      ...statCellStyle,
      background: highlight
        ? `linear-gradient(180deg, ${palette.c5}c0 0%, ${theme.color.bgRaised} 100%)`
        : theme.color.bgRaised,
      borderColor: highlight ? palette.c1 : theme.color.border,
      boxShadow: highlight ? `0 0 10px ${palette.c1}30` : 'none',
      position: 'relative',
    }}>
      <span style={cornerStyle(palette.c1, 'top', 'left', 5)} />
      <span style={cornerStyle(palette.c1, 'bottom', 'right', 5)} />
      <div style={{ ...statCellLabelStyle, color: palette.c4 }}>{label}</div>
      <div style={{ ...statCellValueStyle, color: highlight ? palette.c2 : '#fff' }}>{value}</div>
    </div>
  );
}

function cornerStyle(color: string, vert: 'top' | 'bottom', horiz: 'left' | 'right', size = 8): CSSProperties {
  return {
    position: 'absolute',
    width: size, height: size,
    [vert]: -1,
    [horiz]: -1,
    [vert === 'top' ? 'borderTop' : 'borderBottom']: `2px solid ${color}`,
    [horiz === 'left' ? 'borderLeft' : 'borderRight']: `2px solid ${color}`,
    pointerEvents: 'none',
  } as CSSProperties;
}

// ============================================================
// Styles
// ============================================================

const titleStyle = (p: { c1: string }): CSSProperties => ({
  fontFamily: theme.font.display,
  fontSize: theme.size.h1,
  letterSpacing: theme.letter.wider,
  color: '#fff',
  marginBottom: 6,
  textShadow: `0 0 14px ${p.c1}60`,
});

const identityCardStyle = (p: { c1: string; c5: string }): CSSProperties => ({
  marginTop: theme.space.md,
  padding: `${theme.space.md}px ${theme.space.lg}px`,
  background: `linear-gradient(180deg, ${p.c5}c0 0%, ${theme.color.bgRaised} 80%)`,
  border: `1px solid ${p.c1}`,
  boxShadow: `0 0 16px ${p.c1}40`,
  position: 'relative',
});

const identityTopRowStyle: CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
  gap: 12,
};

const nameBlockStyle: CSSProperties = { flex: 1, minWidth: 0 };
const tierBlockStyle: CSSProperties = { textAlign: 'right', flexShrink: 0 };

const labelStyle = (p: { c4: string }): CSSProperties => ({
  fontFamily: theme.font.mono,
  fontSize: theme.size.micro,
  color: p.c4,
  letterSpacing: theme.letter.wide,
  marginBottom: 4,
});

const nameButtonStyle = (p: { c1: string }): CSSProperties => ({
  background: 'transparent',
  border: 'none',
  color: '#fff',
  fontFamily: theme.font.display,
  fontSize: theme.size.h2,
  letterSpacing: theme.letter.wider,
  cursor: 'pointer',
  padding: 0,
  textShadow: `0 0 10px ${p.c1}40`,
  display: 'flex',
  alignItems: 'center',
  gap: 8,
});

const editIconStyle = (p: { c3: string }): CSSProperties => ({
  fontSize: 12,
  color: p.c3,
});

const nameInputStyle = (p: { c1: string; c5: string }): CSSProperties => ({
  background: p.c5 + '80',
  border: `1px solid ${p.c1}`,
  color: '#fff',
  fontFamily: theme.font.display,
  fontSize: theme.size.h2,
  letterSpacing: theme.letter.wider,
  padding: '4px 8px',
  width: '100%',
  outline: 'none',
});

const tierBadgeStyle: CSSProperties = {
  display: 'inline-block',
  fontFamily: theme.font.mono,
  fontSize: theme.size.tiny,
  letterSpacing: theme.letter.wide,
  padding: '3px 8px',
  border: '1px solid',
};

const factionRowStyle = (color: string): CSSProperties => ({
  marginTop: theme.space.md,
  padding: '6px 10px',
  background: `${color}10`,
  border: `1px solid ${color}80`,
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
});

const factionLabelStyle: CSSProperties = {
  fontFamily: theme.font.mono,
  fontSize: theme.size.micro,
  color: theme.color.textMuted,
  letterSpacing: theme.letter.wide,
};

const factionValueStyle: CSSProperties = {
  fontFamily: theme.font.display,
  fontSize: theme.size.small,
  letterSpacing: theme.letter.wide,
};

const statGridStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(2, 1fr)',
  gap: 6,
};

const statCellStyle: CSSProperties = {
  padding: `${theme.space.sm}px ${theme.space.md}px`,
  border: '1px solid',
};

const statCellLabelStyle: CSSProperties = {
  fontFamily: theme.font.mono,
  fontSize: theme.size.micro,
  letterSpacing: theme.letter.wide,
  marginBottom: 2,
};

const statCellValueStyle: CSSProperties = {
  fontFamily: theme.font.display,
  fontSize: theme.size.h3,
  letterSpacing: theme.letter.tight,
};

const crewBonusRowStyle = (p: { c1: string; c5: string }): CSSProperties => ({
  display: 'flex',
  justifyContent: 'space-around',
  padding: theme.space.md,
  background: `linear-gradient(90deg, ${p.c5}80 0%, ${theme.color.bgRaised} 50%, ${p.c5}80 100%)`,
  border: `1px solid ${p.c1}80`,
});

const crewBonusItemStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: 2,
};

const crewBonusLblStyle = (p: { c4: string }): CSSProperties => ({
  fontFamily: theme.font.mono,
  fontSize: theme.size.micro,
  color: p.c4,
  letterSpacing: theme.letter.wide,
});

const crewBonusValStyle = (p: { c2: string }): CSSProperties => ({
  fontFamily: theme.font.display,
  fontSize: theme.size.h3,
  color: p.c2,
  textShadow: `0 0 8px ${p.c2}40`,
});

const flagListStyle: CSSProperties = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: 4,
};

const flagChipStyle = (p: { c1: string; c3: string; c5: string }): CSSProperties => ({
  fontFamily: theme.font.mono,
  fontSize: theme.size.micro,
  padding: '3px 6px',
  background: `${p.c5}80`,
  color: p.c3,
  border: `1px solid ${p.c1}60`,
  letterSpacing: theme.letter.tight,
});
