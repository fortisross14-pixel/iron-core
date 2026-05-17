import { CSSProperties } from 'react';
import { theme } from '../styles/theme';
import { MODELS } from '../data/models';
import { MechaMini } from './MechaPortrait';
import type { CombatBot } from '../game/combat';
import type { Side } from '../game/combat';

interface Props {
  bot: CombatBot;
  side: Side;
  isCurrent?: boolean;
  isTargetable?: boolean;
  isPickable?: boolean;
  onTap?: () => void;
}

export function PartyBotMini({ bot, side, isCurrent, isTargetable, isPickable, onTap }: Props) {
  const model = MODELS[bot.modelId];
  if (!model) return null;
  const tColor = theme.typeColor[model.type] ?? theme.color.textMuted;
  const dead = bot.hp <= 0;
  const hpPct = Math.max(0, (bot.hp / bot.maxHp) * 100);
  let hpColor = theme.color.success;
  if (hpPct < 50) hpColor = theme.color.warning;
  if (hpPct < 25) hpColor = theme.color.danger;

  const interactive = (isTargetable || isPickable) && !dead && !bot.actedThisRound;

  return (
    <button
      disabled={!interactive}
      onClick={onTap}
      style={{
        ...miniStyle,
        borderColor: side === 'player' ? theme.color.accent : tColor,
        ...(interactive ? targetableStyle : {}),
        ...(isCurrent ? { background: '#1a0f0a', boxShadow: `0 0 12px ${theme.color.accent}` } : {}),
        ...(bot.actedThisRound && !dead ? actedStyle : {}),
        ...(dead ? deadStyle : {}),
      }}>
      <div style={topRowStyle}>
        <MechaMini modelId={bot.modelId} size="sm" />
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={headStyle}>
            <span style={nameStyle}>{bot.firstName}</span>
            <span style={{ ...typeStyle, color: tColor }}>{model.type.slice(0, 3).toUpperCase()}</span>
          </div>
          <div style={surnameStyle}>{model.surname}</div>
        </div>
      </div>
      <div style={hpBarStyle}>
        <div style={{ ...hpFillStyle, width: `${hpPct}%`, background: hpColor }} />
      </div>
      <div style={hpTextStyle}>HP {Math.max(0, bot.hp)}/{bot.maxHp}</div>
      {side === 'player' && (
        <>
          <div style={batBarStyle}>
            <div style={{ ...batFillStyle, width: `${Math.max(0, (bot.bat / bot.maxBattery) * 100)}%` }} />
          </div>
          <div style={batTextStyle}>BAT {Math.max(0, bot.bat)}/{bot.maxBattery}</div>
        </>
      )}
      {bot.actedThisRound && !dead && <div style={actedBadgeStyle}>✓</div>}
    </button>
  );
}

const topRowStyle: CSSProperties = {
  display: 'flex',
  gap: 6,
  alignItems: 'center',
};

const miniStyle: CSSProperties = {
  background: theme.color.bgRaised,
  border: '1px solid',
  padding: 6,
  textAlign: 'left',
  color: theme.color.text,
  transition: 'all 0.15s',
  position: 'relative',
};

const targetableStyle: CSSProperties = { animation: 'ic-glow 1.2s infinite', cursor: 'pointer' };
const actedStyle: CSSProperties = { opacity: 0.5 };
const deadStyle: CSSProperties = { opacity: 0.25, background: theme.color.bgSunken };

const headStyle: CSSProperties = { display: 'flex', justifyContent: 'space-between', alignItems: 'center' };
const nameStyle: CSSProperties = { fontFamily: theme.font.display, fontSize: 11, letterSpacing: theme.letter.tight, color: '#fff' };
const typeStyle: CSSProperties = { fontFamily: theme.font.mono, fontSize: 8, letterSpacing: theme.letter.tight };
const surnameStyle: CSSProperties = { fontFamily: theme.font.mono, fontSize: 8, color: theme.color.textDim, letterSpacing: theme.letter.tight, marginTop: 1 };
const hpBarStyle: CSSProperties = { height: 4, background: theme.color.panel, borderRadius: 1, overflow: 'hidden', marginTop: 4 };
const hpFillStyle: CSSProperties = { height: '100%', transition: 'width 0.4s' };
const hpTextStyle: CSSProperties = { fontFamily: theme.font.mono, fontSize: 8, color: theme.color.textMuted, marginTop: 2 };
const actedBadgeStyle: CSSProperties = { position: 'absolute', top: 4, right: 4, color: theme.color.success, fontSize: 10, fontWeight: 800 };

const batBarStyle: CSSProperties = { height: 3, background: theme.color.panel, borderRadius: 1, overflow: 'hidden', marginTop: 1 };
const batFillStyle: CSSProperties = { height: '100%', background: theme.color.info, transition: 'width 0.4s' };
const batTextStyle: CSSProperties = { fontFamily: theme.font.mono, fontSize: 7, color: theme.color.info, marginTop: 1, letterSpacing: theme.letter.tight };
