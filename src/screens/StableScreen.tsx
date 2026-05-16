import { CSSProperties, useState } from 'react';
import { useGame } from '../state/GameStore';
import { Shell } from '../components/Shell';
import { Button } from '../components/Button';
import { theme } from '../styles/theme';
import { MODELS } from '../data/models';
import { WEAPONS } from '../data/weapons';
import { ARMORS } from '../data/armors';
import { TYPE_INFO } from '../data/types';
import { getBotStats, getBotPower, calcMentorBonuses, getDiskCapacity } from '../game/stats';
import { getBotFullName } from '../game/display';

export function StableScreen() {
  const { state, dispatch } = useGame();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const mentorBonuses = calcMentorBonuses(state.crew);

  return (
    <Shell>
      <button onClick={() => dispatch({ type: 'GO_SCENE', scene: 'town' })} style={backStyle}>← BACK</button>

      <div style={titleStyle}>YOUR STABLE</div>
      <div style={subtitleStyle}>{state.bots.length}/5 bots</div>

      {state.bots.length === 0 ? (
        <div style={emptyStyle}>No bots yet. Visit the workshop or the Voltspire market.</div>
      ) : state.bots.map(bot => {
        const m = MODELS[bot.modelId];
        const t = TYPE_INFO[m.type];
        const stats = getBotStats(bot, mentorBonuses);
        const power = getBotPower(bot, mentorBonuses);
        const tColor = theme.typeColor[m.type];
        const isOpen = expandedId === bot.id;
        const cap = getDiskCapacity(bot);

        return (
          <div key={bot.id} style={{ ...cardStyle, borderColor: isOpen ? tColor : theme.color.border }}>
            <button style={cardHeadStyle} onClick={() => setExpandedId(isOpen ? null : bot.id)}>
              <div>
                <div style={nameStyle}>
                  {getBotFullName(bot)}
                  <span style={{ ...chipStyle, color: tColor, borderColor: tColor }}>{t.name}</span>
                </div>
                <div style={subStyle}>LV {bot.level} · {bot.age.toFixed(1)}y · PWR {power}</div>
              </div>
              <div style={chevronStyle}>{isOpen ? '−' : '+'}</div>
            </button>

            {isOpen && (
              <div style={detailStyle}>
                <div style={statsRowStyle}>
                  <div>ATK <strong>{stats.attack}</strong></div>
                  <div>DEF <strong>{stats.defense}</strong></div>
                  <div>SPD <strong>{stats.speed}</strong></div>
                  <div>INT <strong>{stats.intelligence}</strong></div>
                </div>
                <div style={metaRowStyle}>
                  <div>HP {bot.maxHp}</div>
                  <div>W: {bot.wins} L: {bot.losses}</div>
                  <div>Disks {bot.disksUsed}/{cap}</div>
                </div>
                <div style={equipRowStyle}>
                  <span style={equipLabelStyle}>WEAPON</span>
                  <span>{bot.weapon ? WEAPONS[bot.weapon]?.name : '—'}</span>
                </div>
                <div style={equipRowStyle}>
                  <span style={equipLabelStyle}>ARMOR</span>
                  <span>{bot.armor ? ARMORS[bot.armor]?.name : '—'}</span>
                </div>
                {bot.learnedAttacks.length > 0 && (
                  <div style={equipRowStyle}>
                    <span style={equipLabelStyle}>LEARNED</span>
                    <span style={{ fontSize: theme.size.tiny }}>{bot.learnedAttacks.join(', ')}</span>
                  </div>
                )}
                <Button full variant="secondary" small style={{ marginTop: theme.space.md }}
                  onClick={() => dispatch({ type: 'OPEN_ASSIGN', botId: bot.id })}>
                  ASSIGN ITEMS →
                </Button>
              </div>
            )}
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
  letterSpacing: theme.letter.wider, color: '#fff',
};

const subtitleStyle: CSSProperties = {
  fontFamily: theme.font.mono, fontSize: theme.size.tiny,
  color: theme.color.textMuted, letterSpacing: theme.letter.wide,
  marginTop: 4, marginBottom: theme.space.lg,
};

const cardStyle: CSSProperties = {
  background: theme.color.bgRaised,
  border: '1px solid',
  marginBottom: 8,
  transition: 'border-color 0.15s',
};

const cardHeadStyle: CSSProperties = {
  width: '100%',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: theme.space.md,
  background: 'transparent',
  border: 'none',
  color: theme.color.text,
  cursor: 'pointer',
  textAlign: 'left',
};

const nameStyle: CSSProperties = {
  fontFamily: theme.font.display, fontSize: theme.size.h3,
  letterSpacing: theme.letter.wide, color: '#fff',
  display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap',
};

const subStyle: CSSProperties = {
  fontFamily: theme.font.mono, fontSize: theme.size.tiny,
  color: theme.color.textMuted, marginTop: 2,
};

const chipStyle: CSSProperties = {
  fontFamily: theme.font.mono, fontSize: theme.size.micro,
  letterSpacing: theme.letter.normal,
  padding: '2px 6px', border: '1px solid', borderRadius: 2,
};

const chevronStyle: CSSProperties = { fontSize: 20, color: theme.color.accent };

const detailStyle: CSSProperties = {
  padding: theme.space.md,
  borderTop: `1px solid ${theme.color.border}`,
};

const statsRowStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(4, 1fr)',
  gap: 6,
  fontFamily: theme.font.mono,
  fontSize: theme.size.tiny,
  color: theme.color.textMuted,
  marginBottom: theme.space.sm,
};

const metaRowStyle: CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  fontFamily: theme.font.mono,
  fontSize: theme.size.tiny,
  color: theme.color.info,
  marginBottom: theme.space.sm,
};

const equipRowStyle: CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  fontFamily: theme.font.mono,
  fontSize: theme.size.small,
  marginTop: 4,
};

const equipLabelStyle: CSSProperties = {
  fontSize: theme.size.micro,
  color: theme.color.textDim,
  letterSpacing: theme.letter.wide,
};

const emptyStyle: CSSProperties = {
  padding: theme.space.lg,
  textAlign: 'center',
  color: theme.color.textDim,
  fontSize: theme.size.small,
  fontStyle: 'italic',
};
