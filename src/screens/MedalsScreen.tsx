/**
 * MedalsScreen — trophy cabinet.
 *
 * Top-level tab. Lists every tournament the player has interacted with:
 *   - Tournaments the player has STARTED (any progress) or CHAMPIONED
 *   - Shown grouped by tier (Amateur / Official / Pro / Elite)
 *   - For each: name, host city, tier badge, times won
 *   - Cleared tournaments show a medal icon (✦ or 🏆-style ASCII)
 *
 * Tier tests are excluded — they're one-time achievements, not trophies.
 *
 * Reads:
 *   state.eventProgress    — to know which tournaments have been entered
 *   state.championWins     — to know how many times each was won
 *   TOURNAMENTS data
 *   CITIES data            — for "held in <city>" display
 *   PLACES data            — for "at <place>" display
 */

import { CSSProperties } from 'react';
import { useGame } from '../state/GameStore';
import { Shell } from '../components/Shell';
import { theme } from '../styles/theme';
import { useCityPalette } from '../styles/cityPalette';
import { BracketLabel, EdgeBand } from '../components/Frame';
import { TOURNAMENTS } from '../data/tournaments';
import { CITIES } from '../data/cities';
import { getPlace } from '../data/places';
import { TIER_ORDER, TIER_LABEL } from '../game/tier';
import type { TrainerTier } from '../data/coaches';
import type { MultiFightEvent } from '../data/multifight';

const TIER_COLOR: Record<TrainerTier, string> = {
  amateur: '#888',
  official: '#7fb069',
  professional: '#5fa8ff',
  elite: '#ffd700',
};

export function MedalsScreen() {
  const { state, dispatch } = useGame();
  const palette = useCityPalette();

  const visited = Object.values(TOURNAMENTS).filter(t => {
    const entered = (state.eventProgress[t.id] ?? -1) >= 0;
    const won = (state.championWins[t.id] ?? 0) > 0;
    return entered || won;
  });

  const grouped: Record<TrainerTier, MultiFightEvent[]> = {
    amateur: [], official: [], professional: [], elite: [],
  };
  for (const t of visited) grouped[t.tier].push(t);

  const totalWins = Object.values(state.championWins).reduce((a, b) => a + b, 0);

  return (
    <Shell pageLabel="MEDALS">
      <button onClick={() => dispatch({ type: 'GO_SCENE', scene: 'town' })}
        style={{ background: 'transparent', border: 'none', color: palette.c3, fontFamily: theme.font.mono, fontSize: theme.size.tiny, letterSpacing: theme.letter.wide, cursor: 'pointer', padding: 0, marginBottom: theme.space.md }}>
        ← BACK
      </button>

      <div style={{ marginBottom: theme.space.xs }}>
        <BracketLabel>HALL OF RECORDS</BracketLabel>
      </div>
      <div style={{ fontFamily: theme.font.display, fontSize: theme.size.h1, letterSpacing: theme.letter.wider, color: '#fff', marginBottom: 6, textShadow: `0 0 14px ${palette.c1}60` }}>
        TROPHY CABINET
      </div>
      <EdgeBand color={palette.c1} />

      <div style={{ ...summaryStyle, marginTop: theme.space.md, background: `linear-gradient(180deg, ${palette.c5}c0 0%, ${theme.color.bgRaised} 80%)`, border: `1px solid ${palette.c1}80`, position: 'relative' }}>
        <span style={{ position: 'absolute', top: -1, left: -1, width: 8, height: 8, borderTop: `2px solid ${palette.c1}`, borderLeft: `2px solid ${palette.c1}`, pointerEvents: 'none' }} />
        <span style={{ position: 'absolute', top: -1, right: -1, width: 8, height: 8, borderTop: `2px solid ${palette.c1}`, borderRight: `2px solid ${palette.c1}`, pointerEvents: 'none' }} />
        <span style={{ position: 'absolute', bottom: -1, left: -1, width: 8, height: 8, borderBottom: `2px solid ${palette.c1}`, borderLeft: `2px solid ${palette.c1}`, pointerEvents: 'none' }} />
        <span style={{ position: 'absolute', bottom: -1, right: -1, width: 8, height: 8, borderBottom: `2px solid ${palette.c1}`, borderRight: `2px solid ${palette.c1}`, pointerEvents: 'none' }} />
        <div><span style={{ ...statLblStyle, color: palette.c4 }}>TOTAL WINS</span><span style={{ ...statValStyle, color: palette.c2 }}>{totalWins}</span></div>
        <div><span style={{ ...statLblStyle, color: palette.c4 }}>UNIQUE</span><span style={{ ...statValStyle, color: palette.c2 }}>{Object.keys(state.championWins).length}</span></div>
        <div><span style={{ ...statLblStyle, color: palette.c4 }}>ENTERED</span><span style={{ ...statValStyle, color: palette.c2 }}>{visited.length}</span></div>
      </div>

      {visited.length === 0 && (
        <div style={emptyStyle}>You haven't entered any tournaments yet. Visit the Academy or a Tournament Hall.</div>
      )}

      {TIER_ORDER.map(tier => {
        const list = grouped[tier];
        if (list.length === 0) return null;
        return (
          <div key={tier} style={{ marginTop: theme.space.lg }}>
            <div style={{ ...tierHeaderStyle, color: TIER_COLOR[tier] }}>
              {TIER_LABEL[tier]}
            </div>
            {list.map(t => {
              const wins = state.championWins[t.id] ?? 0;
              const isChamp = wins > 0;
              const cityName = CITIES[
                (getPlace(t.hostLocationId)?.cityId) ?? ''
              ]?.name ?? 'Unknown';
              const placeName = getPlace(t.hostLocationId)?.name ?? '';
              // Faction-flavored medals get a faction-color highlight
              const factionColor = t.id === 'inter_faction' && state.factionId
                ? theme.factionColor[state.factionId]
                : null;
              const isFaction = !!factionColor;
              return (
                <div key={t.id} style={{
                  ...trophyRowStyle,
                  ...(isChamp ? championRowStyle : {}),
                  ...(isFaction ? { borderColor: factionColor!, background: `linear-gradient(90deg, ${factionColor}15 0%, ${theme.color.bgRaised} 70%)` } : {}),
                }}>
                  <div style={{ ...medalIconStyle, color: isFaction ? factionColor! : isChamp ? theme.color.gold : theme.color.textDim }}>
                    {isChamp ? '✦' : '◌'}
                  </div>
                  <div style={trophyBodyStyle}>
                    <div style={trophyNameStyle}>
                      {t.name}
                      {isFaction && <span style={{ ...factionTagStyle, color: factionColor!, borderColor: factionColor! }}>FACTION</span>}
                    </div>
                    <div style={trophyHostStyle}>{placeName} · {cityName}</div>
                  </div>
                  <div style={winCountStyle}>
                    {isChamp ? (
                      <>
                        <div style={winNumberStyle}>×{wins}</div>
                        <div style={winLabelStyle}>WINS</div>
                      </>
                    ) : (
                      <div style={enteredLabelStyle}>ENTERED</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        );
      })}
    </Shell>
  );
}

const backStyle: CSSProperties = {
  background: 'transparent', border: 'none', color: theme.color.textMuted,
  fontFamily: theme.font.mono, fontSize: theme.size.tiny, letterSpacing: theme.letter.wide,
  cursor: 'pointer', padding: 0, marginBottom: theme.space.md,
};

const titleStyle: CSSProperties = {
  fontFamily: theme.font.display, fontSize: theme.size.h1,
  letterSpacing: theme.letter.wider, color: '#fff', marginBottom: theme.space.md,
};

const summaryStyle: CSSProperties = {
  display: 'flex',
  gap: theme.space.lg,
  padding: theme.space.md,
  background: theme.color.bgRaised,
  border: `1px solid ${theme.color.accent}`,
  marginBottom: theme.space.md,
  fontFamily: theme.font.mono,
};

const statLblStyle: CSSProperties = {
  fontSize: theme.size.micro,
  color: theme.color.textDim,
  letterSpacing: theme.letter.wide,
};

const statValStyle: CSSProperties = {
  color: theme.color.accent,
  fontSize: theme.size.h3,
  fontWeight: 800,
  marginLeft: 4,
};

const emptyStyle: CSSProperties = {
  padding: theme.space.lg,
  textAlign: 'center',
  color: theme.color.textDim,
  fontSize: theme.size.small,
  fontStyle: 'italic',
};

const tierHeaderStyle: CSSProperties = {
  fontFamily: theme.font.display,
  fontSize: theme.size.tiny,
  letterSpacing: theme.letter.wide,
  marginBottom: 6,
  paddingBottom: 4,
  borderBottom: `1px solid ${theme.color.border}`,
};

const trophyRowStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: '32px 1fr 60px',
  gap: theme.space.sm,
  alignItems: 'center',
  padding: '10px 10px',
  background: theme.color.bgRaised,
  border: `1px solid ${theme.color.border}`,
  marginBottom: 4,
};

const championRowStyle: CSSProperties = {
  borderColor: theme.color.accent,
  background: '#1a0f0a',
};

const medalIconStyle: CSSProperties = {
  fontSize: 20,
  color: theme.color.accent,
  textAlign: 'center',
};

const trophyBodyStyle: CSSProperties = { minWidth: 0 };

const trophyNameStyle: CSSProperties = {
  fontFamily: theme.font.display,
  fontSize: theme.size.body,
  letterSpacing: theme.letter.tight,
  color: '#fff',
};

const trophyHostStyle: CSSProperties = {
  fontFamily: theme.font.mono,
  fontSize: theme.size.micro,
  color: theme.color.textDim,
  letterSpacing: theme.letter.wide,
  marginTop: 2,
};

const winCountStyle: CSSProperties = {
  textAlign: 'right',
};

const winNumberStyle: CSSProperties = {
  fontFamily: theme.font.display,
  fontSize: theme.size.h3,
  color: theme.color.accent,
  fontWeight: 800,
};

const winLabelStyle: CSSProperties = {
  fontFamily: theme.font.mono,
  fontSize: theme.size.micro,
  color: theme.color.textDim,
  letterSpacing: theme.letter.wide,
};

const enteredLabelStyle: CSSProperties = {
  fontFamily: theme.font.mono,
  fontSize: theme.size.micro,
  color: theme.color.textDim,
  letterSpacing: theme.letter.wide,
};

const factionTagStyle: CSSProperties = {
  fontFamily: theme.font.mono,
  fontSize: theme.size.micro,
  letterSpacing: theme.letter.wide,
  padding: '1px 5px',
  border: '1px solid',
  marginLeft: 6,
};
