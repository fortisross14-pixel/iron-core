/**
 * CaptureChoiceScreen — appears after winning a grind fight against a wild mecha.
 *
 * Player can:
 *   - KEEP the mecha (one per model rule — disabled if you already own this model)
 *   - SALVAGE for parts (always available; grants bonus materials)
 *
 * If KEEP, routes to NamingScreen with the captured model. After naming the
 * bot is added to the roster at the wild's level.
 *
 * If SALVAGE, bonus materials are granted and we return to the grind location.
 */

import { CSSProperties } from 'react';
import { useGame } from '../state/GameStore';
import { Shell } from '../components/Shell';
import { Button } from '../components/Button';
import { MechaFull } from '../components/MechaPortrait';
import { theme } from '../styles/theme';
import { MODELS, RARITY_INFO } from '../data/models';
import { TYPE_INFO } from '../data/types';

export function CaptureChoiceScreen() {
  const { state, dispatch } = useGame();
  const pending = state.pendingCapture;
  if (!pending) return null;
  const model = MODELS[pending.modelId];
  if (!model) return null;

  const tColor = theme.typeColor[model.type];
  const alreadyOwn = state.bots.some(b => b.modelId === model.id);

  return (
    <Shell>
      <div style={titleStyle}>WILD DEFEATED</div>
      <div style={subStyle}>{model.surname.toUpperCase()} stands down. What do you do with it?</div>

      <div style={{ ...mechaCardStyle, borderColor: tColor, display: 'flex', gap: 12, alignItems: 'stretch' }}>
        <MechaFull modelId={model.id} size="md" />
        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
          <div style={mechaHeaderStyle}>
            <div style={mechaNameStyle}>{model.surname}</div>
            <div style={{ ...mechaTypeStyle, color: tColor, borderColor: tColor }}>
              {TYPE_INFO[model.type].name}
            </div>
          </div>
          <div style={mechaSubStyle}>
            <span style={{ color: RARITY_INFO[model.rarity].color }}>{RARITY_INFO[model.rarity].name}</span>
            <span> · LV {pending.level} · {model.role}</span>
          </div>
          <div style={mechaFlavorStyle}>{model.flavor}</div>

          {alreadyOwn && (
            <div style={alreadyOwnStyle}>
              ⚠ You already have a {model.surname}. Only one per model — must salvage.
            </div>
          )}
        </div>
      </div>

      <div style={choicesStyle}>
        <Button full
          disabled={alreadyOwn}
          onClick={() => dispatch({ type: 'CAPTURE_KEEP' })}>
          KEEP — add to stable →
        </Button>
        <div style={hintStyle}>
          Adds the mecha to your stable at LV {pending.level}. You'll name it next.
        </div>
        <Button full variant="secondary"
          onClick={() => dispatch({ type: 'CAPTURE_SALVAGE' })}
          style={{ marginTop: theme.space.md }}>
          SALVAGE for parts →
        </Button>
        <div style={hintStyle}>
          Strip it down. Get 2-3 bonus materials. Sell them at any store.
        </div>
      </div>
    </Shell>
  );
}

const titleStyle: CSSProperties = {
  fontFamily: theme.font.display,
  fontSize: theme.size.h1,
  letterSpacing: theme.letter.wider,
  color: '#fff',
  marginBottom: 4,
};

const subStyle: CSSProperties = {
  fontFamily: theme.font.body,
  fontStyle: 'italic',
  fontSize: theme.size.small,
  color: theme.color.textDim,
  marginBottom: theme.space.lg,
};

const mechaCardStyle: CSSProperties = {
  background: theme.color.bgRaised,
  border: '2px solid',
  padding: theme.space.md,
  marginBottom: theme.space.lg,
};

const mechaHeaderStyle: CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: 4,
};

const mechaNameStyle: CSSProperties = {
  fontFamily: theme.font.display,
  fontSize: theme.size.h2,
  letterSpacing: theme.letter.wide,
  color: '#fff',
};

const mechaTypeStyle: CSSProperties = {
  fontFamily: theme.font.mono,
  fontSize: theme.size.micro,
  letterSpacing: theme.letter.wide,
  padding: '2px 6px',
  border: '1px solid',
  borderRadius: 2,
};

const mechaSubStyle: CSSProperties = {
  fontFamily: theme.font.mono,
  fontSize: theme.size.tiny,
  color: theme.color.textMuted,
  letterSpacing: theme.letter.tight,
  marginBottom: theme.space.sm,
};

const mechaFlavorStyle: CSSProperties = {
  fontFamily: theme.font.body,
  fontStyle: 'italic',
  fontSize: theme.size.small,
  color: theme.color.textDim,
  lineHeight: 1.5,
};

const alreadyOwnStyle: CSSProperties = {
  marginTop: theme.space.md,
  padding: theme.space.sm,
  background: theme.color.danger + '20',
  border: `1px solid ${theme.color.danger}`,
  color: theme.color.danger,
  fontFamily: theme.font.mono,
  fontSize: theme.size.tiny,
  letterSpacing: theme.letter.normal,
  textAlign: 'center',
};

const choicesStyle: CSSProperties = {};

const hintStyle: CSSProperties = {
  fontFamily: theme.font.body,
  fontStyle: 'italic',
  fontSize: theme.size.tiny,
  color: theme.color.textDim,
  textAlign: 'center',
  marginTop: 4,
  lineHeight: 1.4,
};
