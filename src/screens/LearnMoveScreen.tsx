/**
 * LearnMoveScreen — appears when a bot leveled up and learned a new move.
 *
 * Shows:
 *   - The bot (name, level, type)
 *   - The new attack (name, power, accuracy, description)
 *   - The bot's current 3 model-attack slots
 *
 * Player can:
 *   - Tap one of the current slots to REPLACE it with the new attack
 *   - Tap SKIP to forget the new attack
 *
 * After resolution, the queue advances. If empty, returns to town.
 */

import { CSSProperties, useEffect } from 'react';
import { useGame } from '../state/GameStore';
import { Shell } from '../components/Shell';
import { Button } from '../components/Button';
import { theme } from '../styles/theme';
import { MODELS } from '../data/models';
import { ATTACKS } from '../data/attacks';
import { TYPE_INFO } from '../data/types';
import { getBotFullName } from '../game/display';

export function LearnMoveScreen() {
  const { state, dispatch } = useGame();
  const head = state.pendingMoveLearns[0];
  const bot = head ? state.bots.find(b => b.id === head.botId) : undefined;

  // Defensive cleanup if state is inconsistent (no queue or missing bot).
  useEffect(() => {
    if (!head) {
      dispatch({ type: 'GO_SCENE', scene: 'town' });
    } else if (!bot) {
      dispatch({ type: 'MOVE_LEARN_RESOLVE', replaceAttackId: null });
    }
  }, [head, bot, dispatch]);

  if (!head || !bot) return null;

  const model = MODELS[bot.modelId];
  const newAttack = ATTACKS[head.newAttackId];
  const tColor = theme.typeColor[model.type];

  // Current active model attacks (3 slots). If learnedAttacks empty, falls back to defaults.
  const currentAttackIds = bot.learnedAttacks.length > 0 ? bot.learnedAttacks : [...model.defaultAttacks];

  // If there's room (fewer than 3), just add the new attack with no replacement
  const hasRoom = currentAttackIds.length < 3;

  const resolveReplace = (attackId: string) => {
    dispatch({ type: 'MOVE_LEARN_RESOLVE', replaceAttackId: attackId });
  };

  const resolveAdd = () => {
    // When there's room, reducer auto-adds and ignores the replaceAttackId.
    // Pass the new attack id as a placeholder (it'll just be ignored).
    dispatch({ type: 'MOVE_LEARN_RESOLVE', replaceAttackId: head.newAttackId });
  };

  const resolveSkip = () => {
    dispatch({ type: 'MOVE_LEARN_RESOLVE', replaceAttackId: null });
  };

  return (
    <Shell>
      <div style={titleStyle}>NEW ATTACK LEARNED</div>
      <div style={botCardStyle}>
        <div style={botNameStyle}>
          {getBotFullName(bot)}
          <span style={{ ...chipStyle, color: tColor, borderColor: tColor }}>
            {TYPE_INFO[model.type].name}
          </span>
        </div>
        <div style={botMetaStyle}>LV {bot.level}</div>
      </div>

      <div style={newMoveCardStyle}>
        <div style={newMoveHeaderStyle}>{newAttack.name}</div>
        <div style={newMoveStatsStyle}>
          PWR {newAttack.power} · ACC {newAttack.accuracy}%
          {' · '}
          <span style={{ color: newAttack.type === 'physical' ? theme.color.text : theme.typeColor[newAttack.type] }}>
            {newAttack.type.toUpperCase()}
          </span>
        </div>
        <div style={newMoveDescStyle}>{newAttack.desc}</div>
      </div>

      {hasRoom ? (
        <>
          <div style={promptStyle}>This is a new attack slot. Add it to {bot.firstName}'s moves?</div>
          <Button full onClick={resolveAdd} style={{ marginTop: theme.space.sm }}>LEARN →</Button>
          <Button variant="ghost" full small onClick={resolveSkip} style={{ marginTop: theme.space.sm }}>SKIP</Button>
        </>
      ) : (
        <>
          <div style={promptStyle}>
            {bot.firstName} already knows 3 moves. Tap one to forget — or skip to keep the current set.
          </div>
          {currentAttackIds.map(id => {
            const a = ATTACKS[id];
            if (!a) return null;
            return (
              <button key={id}
                onClick={() => resolveReplace(id)}
                style={replaceBtnStyle}>
                <div style={replaceHeadStyle}>
                  <span style={replaceNameStyle}>{a.name}</span>
                  <span style={{ color: a.type === 'physical' ? theme.color.text : theme.typeColor[a.type], fontSize: 10 }}>
                    {a.type.toUpperCase()}
                  </span>
                </div>
                <div style={replaceStatsStyle}>PWR {a.power} · ACC {a.accuracy}%</div>
                <div style={replaceDescStyle}>{a.desc}</div>
                <div style={replaceHintStyle}>→ FORGET TO LEARN {newAttack.name.toUpperCase()}</div>
              </button>
            );
          })}
          <Button variant="ghost" full small onClick={resolveSkip} style={{ marginTop: theme.space.sm }}>
            SKIP — DON'T LEARN
          </Button>
        </>
      )}

      <div style={remainingStyle}>
        {state.pendingMoveLearns.length > 1 && `${state.pendingMoveLearns.length - 1} more pending after this`}
      </div>
    </Shell>
  );
}

const titleStyle: CSSProperties = {
  fontFamily: theme.font.display, fontSize: theme.size.h1,
  letterSpacing: theme.letter.wider, color: theme.color.accent,
  marginBottom: theme.space.md, textAlign: 'center',
  textShadow: `0 0 16px ${theme.color.accent}66`,
};

const botCardStyle: CSSProperties = {
  background: theme.color.bgRaised,
  border: `1px solid ${theme.color.border}`,
  padding: theme.space.md,
  marginBottom: theme.space.sm,
};

const botNameStyle: CSSProperties = {
  fontFamily: theme.font.display,
  fontSize: theme.size.h3,
  letterSpacing: theme.letter.wide,
  color: '#fff',
  display: 'flex',
  alignItems: 'center',
  gap: 6,
};

const botMetaStyle: CSSProperties = {
  fontFamily: theme.font.mono,
  fontSize: theme.size.tiny,
  color: theme.color.textMuted,
  marginTop: 2,
};

const chipStyle: CSSProperties = {
  fontFamily: theme.font.mono, fontSize: theme.size.micro, letterSpacing: theme.letter.normal,
  padding: '2px 6px', border: '1px solid', borderRadius: 2,
};

const newMoveCardStyle: CSSProperties = {
  background: theme.color.bgRaised,
  border: `2px solid ${theme.color.accent}`,
  padding: theme.space.md,
  marginBottom: theme.space.md,
  boxShadow: `0 0 12px ${theme.color.accent}40`,
};

const newMoveHeaderStyle: CSSProperties = {
  fontFamily: theme.font.display,
  fontSize: theme.size.h2,
  letterSpacing: theme.letter.wide,
  color: '#fff',
};

const newMoveStatsStyle: CSSProperties = {
  fontFamily: theme.font.mono,
  fontSize: theme.size.small,
  color: theme.color.accent,
  marginTop: 4,
  letterSpacing: theme.letter.tight,
};

const newMoveDescStyle: CSSProperties = {
  fontFamily: theme.font.body,
  fontStyle: 'italic',
  fontSize: theme.size.small,
  color: theme.color.text,
  marginTop: 8,
  lineHeight: 1.5,
};

const promptStyle: CSSProperties = {
  fontFamily: theme.font.body,
  fontSize: theme.size.small,
  color: theme.color.text,
  textAlign: 'center',
  margin: `${theme.space.md}px 0 ${theme.space.sm}px`,
  lineHeight: 1.5,
};

const replaceBtnStyle: CSSProperties = {
  display: 'block',
  width: '100%',
  background: theme.color.bgRaised,
  border: `1px solid ${theme.color.border}`,
  padding: theme.space.md,
  marginBottom: 6,
  cursor: 'pointer',
  textAlign: 'left',
  color: theme.color.text,
  font: 'inherit',
};

const replaceHeadStyle: CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
};

const replaceNameStyle: CSSProperties = {
  fontFamily: theme.font.display,
  fontSize: theme.size.body,
  letterSpacing: theme.letter.tight,
  color: '#fff',
};

const replaceStatsStyle: CSSProperties = {
  fontFamily: theme.font.mono,
  fontSize: theme.size.tiny,
  color: theme.color.textMuted,
  marginTop: 4,
};

const replaceDescStyle: CSSProperties = {
  fontFamily: theme.font.body,
  fontStyle: 'italic',
  fontSize: theme.size.tiny,
  color: theme.color.textDim,
  marginTop: 4,
};

const replaceHintStyle: CSSProperties = {
  fontFamily: theme.font.mono,
  fontSize: theme.size.micro,
  color: theme.color.danger,
  letterSpacing: theme.letter.wide,
  marginTop: 6,
};

const remainingStyle: CSSProperties = {
  textAlign: 'center',
  marginTop: theme.space.md,
  fontFamily: theme.font.mono,
  fontSize: theme.size.tiny,
  color: theme.color.textDim,
  letterSpacing: theme.letter.wide,
};
