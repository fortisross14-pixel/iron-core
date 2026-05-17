/**
 * TournamentBetweenScreen — shown between fights in a multi-fight tournament.
 *
 * Routed when the player wins a tournament fight that isn't the final round.
 * Three buttons:
 *   - NEXT FIGHT     → starts the queued next bracket fight (uses carryOver)
 *   - USE ITEM       → apply a consumable to a bot (HP repair or battery kit)
 *   - ABANDON        → forfeit the bracket; progress resets, no rewards
 *
 * Roster shows current HP/BAT (after carry-over applied) for each team bot.
 */

import { CSSProperties, useState } from 'react';
import { useGame } from '../state/GameStore';
import { useBattleOrchestrator } from '../hooks/useBattleOrchestrator';
import { Shell } from '../components/Shell';
import { Button } from '../components/Button';
import { BracketLabel, EdgeBand } from '../components/Frame';
import { useCityPalette } from '../styles/cityPalette';
import { theme } from '../styles/theme';
import { TOURNAMENTS } from '../data/tournaments';
import { TIER_TESTS } from '../data/tests';
import { ITEMS } from '../data/items';
import { getBattery } from '../data/batteries';
import { MODELS } from '../data/models';
import { MechaMini } from '../components/MechaPortrait';

export function TournamentBetweenScreen() {
  const { state, dispatch } = useGame();
  const palette = useCityPalette();
  const { startBattle } = useBattleOrchestrator();
  const [sub, setSub] = useState<'main' | 'items'>('main');
  const [targetBotId, setTargetBotId] = useState<string | null>(null);

  const at = state.activeTournament;
  if (!at) {
    return (
      <Shell pageLabel="ERROR">
        <div style={{ padding: 20 }}>No active tournament.</div>
        <Button full onClick={() => dispatch({ type: 'GO_SCENE', scene: 'town' })}>← BACK</Button>
      </Shell>
    );
  }

  const event = TOURNAMENTS[at.tournamentId] ?? TIER_TESTS[at.tournamentId];
  if (!event) {
    return <Shell><div>Unknown tournament.</div></Shell>;
  }

  const teamBots = at.teamBotIds
    .map(id => state.bots.find(b => b.id === id))
    .filter((b): b is NonNullable<typeof b> => Boolean(b));

  const nextIdx = at.bracketIndex;
  const nextFight = event.bracket[nextIdx];
  const totalFights = event.bracket.length;

  const onNextFight = () => {
    startBattle();
  };

  const onAbandon = () => {
    if (confirm('Abandon the tournament? Bracket progress will reset to round 1.')) {
      dispatch({ type: 'TOURNAMENT_ABANDON' });
    }
  };

  // ITEM SUBSCREEN — pick item, then pick bot
  if (sub === 'items') {
    const usableItems = Object.entries(state.items).filter(([id, c]) => {
      if (c <= 0) return false;
      const it = ITEMS[id];
      return it && (it.effect.type === 'heal' || it.effect.type === 'recharge');
    });

    return (
      <Shell pageLabel="USE ITEM">
        <button onClick={() => setSub('main')} style={backStyle(palette)}>← BACK</button>
        <div style={titleStyle(palette)}>USE ITEM</div>
        <EdgeBand color={palette.c1} />

        {usableItems.length === 0 ? (
          <div style={emptyStyle}>No usable items. Buy some at a store.</div>
        ) : (
          <>
            <div style={subHeadStyle}>1. PICK AN ITEM</div>
            {usableItems.map(([id, count]) => {
              const it = ITEMS[id];
              return (
                <div key={id} style={itemRowStyle(palette)}>
                  <div style={{ flex: 1 }}>
                    <div style={itemNameStyle}>{it.name} <span style={ownedStyle}>×{count}</span></div>
                    <div style={itemDescStyle}>{it.desc}</div>
                  </div>
                </div>
              );
            })}

            <div style={{ ...subHeadStyle, marginTop: theme.space.lg }}>2. PICK A BOT</div>
            {teamBots.map(bot => {
              const maxBat = getBattery(bot.battery).capacity;
              const carry = at.carryOver?.[bot.id];
              const hp = carry?.hp ?? bot.maxHp;
              const bat = carry?.bat ?? maxBat;
              const model = MODELS[bot.modelId];
              return (
                <div key={bot.id} style={botRowStyle(palette)}>
                  <MechaMini modelId={bot.modelId} size="sm" />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={botNameStyle}>{bot.firstName}</div>
                    <div style={botStatsStyle}>
                      <span style={{ color: hp < bot.maxHp * 0.5 ? theme.color.danger : theme.color.text }}>HP {hp}/{bot.maxHp}</span>
                      {' · '}
                      <span style={{ color: theme.color.info }}>BAT {bat}/{maxBat}</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    {usableItems.map(([id]) => {
                      const it = ITEMS[id];
                      const applicable = it.effect.type === 'heal' ? hp < bot.maxHp : bat < maxBat;
                      return (
                        <Button key={id} small disabled={!applicable}
                          onClick={() => dispatch({ type: 'TOURNAMENT_USE_ITEM', itemId: id, botId: bot.id })}>
                          {it.effect.type === 'heal' ? '+HP' : '+BAT'}
                        </Button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </>
        )}
      </Shell>
    );
  }

  // MAIN VIEW
  return (
    <Shell pageLabel="TOURNAMENT BREAK">
      <div style={{ marginBottom: theme.space.xs }}>
        <BracketLabel>BRACKET · ROUND {nextIdx + 1} OF {totalFights}</BracketLabel>
      </div>
      <div style={titleStyle(palette)}>BETWEEN FIGHTS</div>
      <EdgeBand color={palette.c1} />

      <div style={tournamentInfoStyle(palette)}>
        <div style={tournamentNameStyle}>{event.name}</div>
        <div style={progressStyle}>
          {Array.from({ length: totalFights }, (_, i) => (
            <span key={i} style={i < nextIdx ? wonDotStyle(palette) : i === nextIdx ? upcomingDotStyle(palette) : pendingDotStyle}>●</span>
          ))}
        </div>
        {nextFight && (
          <div style={nextFightStyle}>
            Next: Level {nextFight.oppLevel}{nextFight.trainerId && ' · trainer fight'}
          </div>
        )}
      </div>

      <div style={{ marginTop: theme.space.lg, marginBottom: theme.space.sm }}>
        <BracketLabel>YOUR ROSTER</BracketLabel>
      </div>
      <div style={rosterStyle}>
        {teamBots.map(bot => {
          const maxBat = getBattery(bot.battery).capacity;
          const carry = at.carryOver?.[bot.id];
          const hp = carry?.hp ?? bot.maxHp;
          const bat = carry?.bat ?? maxBat;
          const hpPct = (hp / bot.maxHp) * 100;
          const batPct = (bat / maxBat) * 100;
          const hpColor = hpPct < 25 ? theme.color.danger : hpPct < 50 ? theme.color.warning : theme.color.success;
          return (
            <div key={bot.id} style={rosterRowStyle(palette)}>
              <MechaMini modelId={bot.modelId} size="md" />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={botNameStyle}>{bot.firstName}</div>
                <div style={barLabelStyle}>HP {hp}/{bot.maxHp}</div>
                <div style={barStyle}>
                  <div style={{ ...barFillStyle, width: `${hpPct}%`, background: hpColor }} />
                </div>
                <div style={barLabelStyle}>BAT {bat}/{maxBat}</div>
                <div style={barStyle}>
                  <div style={{ ...barFillStyle, width: `${batPct}%`, background: theme.color.info }} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: theme.space.sm, marginTop: theme.space.lg }}>
        <Button full onClick={onNextFight}>NEXT FIGHT →</Button>
        <Button full variant="secondary" onClick={() => setSub('items')}>USE ITEM</Button>
        <Button full variant="danger" onClick={onAbandon}>ABANDON TOURNAMENT</Button>
      </div>
    </Shell>
  );
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

const backStyle = (p: { c3: string }): CSSProperties => ({
  background: 'transparent',
  border: 'none',
  color: p.c3,
  fontFamily: theme.font.mono,
  fontSize: theme.size.tiny,
  letterSpacing: theme.letter.wide,
  cursor: 'pointer',
  padding: 0,
  marginBottom: theme.space.md,
});

const tournamentInfoStyle = (p: { c1: string; c5: string }): CSSProperties => ({
  marginTop: theme.space.md,
  padding: `${theme.space.md}px ${theme.space.lg}px`,
  background: `linear-gradient(180deg, ${p.c5}c0 0%, ${theme.color.bgRaised} 80%)`,
  border: `1px solid ${p.c1}`,
  textAlign: 'center',
});

const tournamentNameStyle: CSSProperties = {
  fontFamily: theme.font.display,
  fontSize: theme.size.h3,
  color: '#fff',
  letterSpacing: theme.letter.wide,
  marginBottom: 6,
};

const progressStyle: CSSProperties = {
  display: 'flex',
  justifyContent: 'center',
  gap: 8,
  fontSize: 18,
  marginBottom: 6,
};

const wonDotStyle = (p: { c2: string }): CSSProperties => ({
  color: p.c2,
  textShadow: `0 0 6px ${p.c2}`,
});

const upcomingDotStyle = (p: { c1: string }): CSSProperties => ({
  color: p.c1,
  textShadow: `0 0 8px ${p.c1}`,
});

const pendingDotStyle: CSSProperties = {
  color: theme.color.textDim,
};

const nextFightStyle: CSSProperties = {
  fontFamily: theme.font.mono,
  fontSize: theme.size.tiny,
  color: theme.color.textMuted,
  letterSpacing: theme.letter.wide,
};

const rosterStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 6,
};

const rosterRowStyle = (p: { c1: string }): CSSProperties => ({
  display: 'flex',
  gap: 10,
  alignItems: 'center',
  padding: theme.space.sm,
  background: theme.color.bgRaised,
  border: `1px solid ${p.c1}30`,
});

const botNameStyle: CSSProperties = {
  fontFamily: theme.font.display,
  fontSize: theme.size.small,
  letterSpacing: theme.letter.wide,
  color: '#fff',
  marginBottom: 4,
};

const botStatsStyle: CSSProperties = {
  fontFamily: theme.font.mono,
  fontSize: theme.size.tiny,
  color: theme.color.textMuted,
};

const barLabelStyle: CSSProperties = {
  fontFamily: theme.font.mono,
  fontSize: 9,
  color: theme.color.textDim,
  letterSpacing: theme.letter.tight,
  marginBottom: 2,
};

const barStyle: CSSProperties = {
  height: 6,
  background: theme.color.panel,
  overflow: 'hidden',
  marginBottom: 4,
};

const barFillStyle: CSSProperties = {
  height: '100%',
  transition: 'width 0.4s',
};

const subHeadStyle: CSSProperties = {
  fontFamily: theme.font.mono,
  fontSize: theme.size.tiny,
  color: theme.color.textMuted,
  letterSpacing: theme.letter.wide,
  marginTop: theme.space.md,
  marginBottom: theme.space.xs,
};

const itemRowStyle = (p: { c1: string }): CSSProperties => ({
  padding: theme.space.sm,
  background: theme.color.bgRaised,
  border: `1px solid ${p.c1}30`,
  marginBottom: 4,
});

const botRowStyle = (p: { c1: string }): CSSProperties => ({
  display: 'flex',
  gap: 10,
  alignItems: 'center',
  padding: theme.space.sm,
  background: theme.color.bgRaised,
  border: `1px solid ${p.c1}30`,
  marginBottom: 6,
});

const itemNameStyle: CSSProperties = {
  fontFamily: theme.font.display,
  fontSize: theme.size.small,
  color: '#fff',
  letterSpacing: theme.letter.wide,
};

const itemDescStyle: CSSProperties = {
  fontFamily: theme.font.body,
  fontSize: theme.size.tiny,
  color: theme.color.textDim,
  marginTop: 2,
};

const ownedStyle: CSSProperties = {
  fontFamily: theme.font.mono,
  fontSize: theme.size.tiny,
  color: theme.color.textMuted,
  marginLeft: 8,
};

const emptyStyle: CSSProperties = {
  padding: theme.space.lg,
  textAlign: 'center',
  color: theme.color.textDim,
  fontStyle: 'italic',
};
