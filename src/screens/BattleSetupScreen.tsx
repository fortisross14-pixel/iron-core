import { CSSProperties } from 'react';
import { useGame } from '../state/GameStore';
import { Shell } from '../components/Shell';
import { Button } from '../components/Button';
import { theme } from '../styles/theme';
import { MODELS } from '../data/models';
import { TYPE_INFO } from '../data/types';
import { getBotPower, calcMentorBonuses } from '../game/stats';
import { getBotFullName } from '../game/display';
import { useBattleOrchestrator } from '../hooks/useBattleOrchestrator';

export function BattleSetupScreen() {
  const { state, dispatch } = useGame();
  const { startBattle } = useBattleOrchestrator();
  const battle = state.pendingBattle;
  if (!battle) return null;

  const mentorBonuses = calcMentorBonuses(state.crew);

  return (
    <Shell>
      <button onClick={() => dispatch({ type: 'CANCEL_BATTLE' })} style={backStyle}>← BACK</button>
      <div style={titleStyle}>BATTLE SETUP</div>
      <div style={descStyle}>
        {battle.source === 'junkyard' ? 'Junkyard skirmish — wild abandoned mecha' :
         battle.source === 'tournament' ? `Tournament: ${battle.sourceId}` :
         battle.source === 'story' ? 'Story battle' : 'Skirmish'}
      </div>
      <div style={metaStyle}>
        {battle.teamSize}v{battle.teamSize} · opp lv ~{battle.oppLevel}
      </div>

      <div style={sectionStyle}>PICK {battle.teamSize} BOT{battle.teamSize > 1 ? 'S' : ''} · {state.battleSetupTeam.length}/{battle.teamSize}</div>

      {state.bots.length === 0 ? (
        <div style={emptyStyle}>You have no bots. Visit your uncle.</div>
      ) : state.bots.map(bot => {
        const m = MODELS[bot.modelId];
        const tColor = theme.typeColor[m.type];
        const power = getBotPower(bot, mentorBonuses);
        const sel = state.battleSetupTeam.includes(bot.id);
        return (
          <button key={bot.id} onClick={() => dispatch({ type: 'TOGGLE_BATTLE_SELECT', botId: bot.id })}
            style={{
              ...rowStyle,
              borderColor: sel ? theme.color.accent : theme.color.border,
              background: sel ? '#1a0f0a' : theme.color.bgRaised,
            }}>
            <div>
              <div style={nameStyle}>
                {getBotFullName(bot)}
                <span style={{ ...chipStyle, color: tColor, borderColor: tColor }}>{TYPE_INFO[m.type].name}</span>
              </div>
              <div style={subStyle}>LV {bot.level} · PWR {power}</div>
            </div>
            <div style={indicatorStyle}>{sel ? '✓' : '+'}</div>
          </button>
        );
      })}

      <Button full disabled={state.battleSetupTeam.length !== battle.teamSize} onClick={startBattle} style={{ marginTop: theme.space.lg }}>
        ENGAGE →
      </Button>
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

const descStyle: CSSProperties = {
  fontFamily: theme.font.body, fontSize: theme.size.small,
  color: theme.color.textMuted, marginTop: 4, fontStyle: 'italic',
};

const metaStyle: CSSProperties = {
  fontFamily: theme.font.mono, fontSize: theme.size.tiny,
  color: theme.color.info, letterSpacing: theme.letter.normal, marginTop: 6, marginBottom: theme.space.lg,
};

const sectionStyle: CSSProperties = {
  fontFamily: theme.font.mono, fontSize: theme.size.tiny,
  color: theme.color.accent, letterSpacing: theme.letter.wide,
  marginTop: theme.space.lg, marginBottom: theme.space.sm,
};

const rowStyle: CSSProperties = {
  width: '100%',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  border: '1px solid',
  padding: theme.space.md,
  color: theme.color.text,
  textAlign: 'left',
  cursor: 'pointer',
  marginBottom: 6,
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
  letterSpacing: theme.letter.normal, padding: '2px 6px',
  border: '1px solid', borderRadius: 2,
};

const indicatorStyle: CSSProperties = { fontSize: 22, color: theme.color.accent };

const emptyStyle: CSSProperties = {
  padding: theme.space.lg, textAlign: 'center',
  color: theme.color.textDim, fontSize: theme.size.small, fontStyle: 'italic',
};
