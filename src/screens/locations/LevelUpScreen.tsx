/**
 * LevelUpScreen — modal announcement screen shown after a bot levels up.
 *
 * Driven by state.pendingLevelUps queue. Shows:
 *   - "LEVEL UP" big headline
 *   - Mecha portrait + name + new level
 *   - Stat table with before → after columns and delta
 *   - CONTINUE button consumes the head of the queue
 *
 * After CONTINUE, if more level-ups remain it shows the next one. When the
 * queue is empty, the router naturally falls back to the next scene (which
 * is usually 'postFight' since that's where this gets injected from).
 *
 * Layered routing: the App must route to 'levelUp' scene whenever
 * pendingLevelUps is non-empty, BEFORE other scenes.
 */

import { CSSProperties } from 'react';
import { useGame } from '../state/GameStore';
import { Button } from '../components/Button';
import { MechaMini } from '../components/MechaPortrait';
import { theme } from '../styles/theme';
import { MODELS } from '../data/models';
import { TYPE_INFO } from '../data/types';

export function LevelUpScreen() {
  const { state, dispatch } = useGame();
  const announcement = state.pendingLevelUps[0];

  // Should be guarded by App router, but defensive return just in case
  if (!announcement) return null;

  const bot = state.bots.find(b => b.id === announcement.botId);
  const model = bot ? MODELS[bot.modelId] : null;

  if (!bot || !model) {
    // Bot vanished somehow — just dismiss
    dispatch({ type: 'ACK_LEVEL_UP' });
    return null;
  }

  const tColor = theme.typeColor[model.type];
  const prev = announcement.prevStats;
  const next = announcement.newStats;
  const dHp = next.hp - prev.hp;
  const dAtk = next.attack - prev.attack;
  const dDef = next.defense - prev.defense;
  const dSpd = next.speed - prev.speed;
  const dInt = next.intelligence - prev.intelligence;

  return (
    <div style={overlayStyle}>
      <div style={modalStyle(tColor)}>
        <span style={cornerStyle(tColor, 'top', 'left')} />
        <span style={cornerStyle(tColor, 'top', 'right')} />
        <span style={cornerStyle(tColor, 'bottom', 'left')} />
        <span style={cornerStyle(tColor, 'bottom', 'right')} />

        <div style={headlineStyle(tColor)}>LEVEL UP</div>
        <div style={subheadStyle}>NEW POWER UNLOCKED</div>

        <div style={portraitRowStyle}>
          <MechaMini modelId={bot.modelId} size="lg" />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={botNameStyle}>{bot.firstName} {model.surname}</div>
            <div style={typeRowStyle}>
              <span style={{ ...typeChipStyle, color: tColor, borderColor: tColor }}>
                {TYPE_INFO[model.type].name}-TYPE
              </span>
            </div>
            <div style={levelLineStyle}>
              <span style={oldLevelStyle}>LV {announcement.newLevel - 1}</span>
              <span style={arrowStyle(tColor)}>→</span>
              <span style={newLevelStyle(tColor)}>LV {announcement.newLevel}</span>
            </div>
          </div>
        </div>

        <div style={statsHeaderStyle}>
          <span style={statHeadColStyle}>STAT</span>
          <span style={statHeadColStyle}>BEFORE</span>
          <span style={statHeadColStyle}>AFTER</span>
          <span style={statHeadColStyle}>CHANGE</span>
        </div>

        <StatRow label="HP"   before={prev.hp}           after={next.hp}           delta={dHp} tColor={tColor} />
        <StatRow label="ATK"  before={prev.attack}       after={next.attack}       delta={dAtk} tColor={tColor} />
        <StatRow label="DEF"  before={prev.defense}      after={next.defense}      delta={dDef} tColor={tColor} />
        <StatRow label="SPD"  before={prev.speed}        after={next.speed}        delta={dSpd} tColor={tColor} />
        <StatRow label="INT"  before={prev.intelligence} after={next.intelligence} delta={dInt} tColor={tColor} />

        <Button full onClick={() => dispatch({ type: 'ACK_LEVEL_UP' })} style={{ marginTop: theme.space.lg }}>
          CONTINUE →
        </Button>
        {state.pendingLevelUps.length > 1 && (
          <div style={moreStyle}>{state.pendingLevelUps.length - 1} more announcement{state.pendingLevelUps.length > 2 ? 's' : ''} after this</div>
        )}
      </div>
    </div>
  );
}

function StatRow({ label, before, after, delta, tColor }: {
  label: string;
  before: number;
  after: number;
  delta: number;
  tColor: string;
}) {
  return (
    <div style={statRowStyle}>
      <span style={statLabelStyle}>{label}</span>
      <span style={statValStyle}>{before}</span>
      <span style={statValStyle}>{after}</span>
      <span style={{ ...statDeltaStyle, color: delta > 0 ? tColor : delta < 0 ? theme.color.danger : theme.color.textDim }}>
        {delta > 0 ? `+${delta}` : delta < 0 ? `${delta}` : '—'}
      </span>
    </div>
  );
}

const overlayStyle: CSSProperties = {
  position: 'fixed',
  inset: 0,
  background: 'rgba(0,0,0,0.95)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: 20,
  zIndex: 2000,
  overflowY: 'auto',
};

const modalStyle = (tColor: string): CSSProperties => ({
  width: '100%',
  maxWidth: 380,
  background: `linear-gradient(180deg, ${tColor}25 0%, ${theme.color.bgRaised} 30%, ${theme.color.bgRaised} 100%)`,
  border: `2px solid ${tColor}`,
  boxShadow: `0 0 40px ${tColor}60`,
  padding: '24px 20px',
  position: 'relative',
});

const cornerStyle = (color: string, v: 'top' | 'bottom', h: 'left' | 'right', size = 14): CSSProperties => ({
  position: 'absolute',
  width: size,
  height: size,
  [v]: -1,
  [h]: -1,
  [v === 'top' ? 'borderTop' : 'borderBottom']: `2px solid ${color}`,
  [h === 'left' ? 'borderLeft' : 'borderRight']: `2px solid ${color}`,
  pointerEvents: 'none',
} as CSSProperties);

const headlineStyle = (tColor: string): CSSProperties => ({
  fontFamily: theme.font.display,
  fontSize: 36,
  letterSpacing: 6,
  color: '#fff',
  textAlign: 'center',
  textShadow: `0 0 20px ${tColor}, 0 0 8px ${tColor}`,
  marginBottom: 4,
});

const subheadStyle: CSSProperties = {
  fontFamily: theme.font.mono,
  fontSize: 10,
  letterSpacing: 3,
  color: theme.color.textMuted,
  textAlign: 'center',
  marginBottom: theme.space.lg,
};

const portraitRowStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 14,
  padding: theme.space.md,
  background: theme.color.bgSunken,
  marginBottom: theme.space.lg,
};

const botNameStyle: CSSProperties = {
  fontFamily: theme.font.display,
  fontSize: theme.size.h3,
  color: '#fff',
  letterSpacing: 1,
  marginBottom: 4,
};

const typeRowStyle: CSSProperties = {
  display: 'flex',
  gap: 4,
  marginBottom: 6,
};

const typeChipStyle: CSSProperties = {
  fontFamily: theme.font.mono,
  fontSize: 9,
  letterSpacing: 1.5,
  padding: '2px 6px',
  border: '1px solid',
};

const levelLineStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'baseline',
  gap: 8,
};

const oldLevelStyle: CSSProperties = {
  fontFamily: theme.font.display,
  fontSize: theme.size.body,
  color: theme.color.textDim,
};

const arrowStyle = (tColor: string): CSSProperties => ({
  fontSize: 14,
  color: tColor,
});

const newLevelStyle = (tColor: string): CSSProperties => ({
  fontFamily: theme.font.display,
  fontSize: theme.size.h2,
  color: tColor,
  textShadow: `0 0 10px ${tColor}80`,
  letterSpacing: 2,
});

const statsHeaderStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: '60px 1fr 1fr 1fr',
  gap: 8,
  padding: '6px 8px',
  background: theme.color.bgSunken,
  borderBottom: `1px solid ${theme.color.border}`,
};

const statHeadColStyle: CSSProperties = {
  fontFamily: theme.font.mono,
  fontSize: 9,
  letterSpacing: 1.5,
  color: theme.color.textMuted,
  textAlign: 'center',
};

const statRowStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: '60px 1fr 1fr 1fr',
  gap: 8,
  padding: '8px',
  borderBottom: `1px solid ${theme.color.border}`,
  alignItems: 'center',
};

const statLabelStyle: CSSProperties = {
  fontFamily: theme.font.mono,
  fontSize: theme.size.tiny,
  letterSpacing: 1.5,
  color: theme.color.textMuted,
};

const statValStyle: CSSProperties = {
  fontFamily: theme.font.display,
  fontSize: theme.size.body,
  color: '#fff',
  textAlign: 'center',
};

const statDeltaStyle: CSSProperties = {
  fontFamily: theme.font.display,
  fontSize: theme.size.body,
  textAlign: 'center',
  letterSpacing: 1,
};

const moreStyle: CSSProperties = {
  marginTop: 8,
  textAlign: 'center',
  fontFamily: theme.font.mono,
  fontSize: 10,
  color: theme.color.textMuted,
  letterSpacing: 1,
};
