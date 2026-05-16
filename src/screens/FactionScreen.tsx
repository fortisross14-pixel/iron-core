import { CSSProperties } from 'react';
import { useGame } from '../state/GameStore';
import { FACTION_LIST, FACTIONS } from '../data/factions';
import { TYPE_INFO } from '../data/types';
import { theme } from '../styles/theme';
import { Button } from '../components/Button';
import { Shell } from '../components/Shell';

export function FactionScreen() {
  const { state, dispatch } = useGame();

  return (
    <Shell>
      <div style={titleStyle}>CHOOSE A FACTION</div>
      <div style={blurbStyle}>
        In Voltspire, every Operator eventually picks a side. You don't have to decide today —
        but understanding what each one stands for will tell you what they'll ask of you.
      </div>

      <div style={listStyle}>
        {FACTION_LIST.map(f => (
          <div key={f.id} style={{
            ...cardStyle,
            borderColor: state.factionId === f.id ? theme.factionColor[f.id] : theme.color.border,
            boxShadow: state.factionId === f.id ? `0 0 14px ${theme.factionColor[f.id]}40` : 'none',
          }}>
            <div style={{ ...factionNameStyle, color: theme.factionColor[f.id] }}>{f.name}</div>
            <div style={mottoStyle}>"{f.motto}"</div>
            <div style={longDescStyle}>{f.longDesc}</div>
            <div style={metaStyle}>
              <div style={metaLineStyle}>
                <span style={metaLabelStyle}>FAVORS</span>
                {f.preferredTypes.map(t => (
                  <span key={t} style={{ ...typeChipStyle, color: theme.typeColor[t], borderColor: theme.typeColor[t] }}>
                    {TYPE_INFO[t].name}
                  </span>
                ))}
              </div>
              <div style={metaLineStyle}>
                <span style={metaLabelStyle}>TEMPER</span>
                <span style={metaValueStyle}>{f.temperament === 'peaceful' ? 'Peaceful' : 'Warring'}</span>
              </div>
              <div style={metaLineStyle}>
                <span style={metaLabelStyle}>BONUS</span>
                <span style={metaValueStyle}>+{Math.round((f.affinityBonus - 1) * 100)}% dmg with favored types</span>
              </div>
            </div>
            <Button
              full
              variant={state.factionId === f.id ? 'primary' : 'secondary'}
              onClick={() => dispatch({ type: 'PICK_FACTION', factionId: f.id })}
              style={{ marginTop: theme.space.lg }}>
              {state.factionId === f.id ? '✓ AFFILIATED' : 'AFFILIATE'}
            </Button>
          </div>
        ))}
      </div>

      <Button full variant="ghost" onClick={() => dispatch({ type: 'GO_SCENE', scene: 'town' })} style={{ marginTop: theme.space.xl }}>
        {state.factionId ? 'CONFIRM & RETURN' : 'NOT YET — RETURN'}
      </Button>
    </Shell>
  );
}

const titleStyle: CSSProperties = {
  fontFamily: theme.font.display,
  fontSize: theme.size.h1,
  letterSpacing: theme.letter.widest,
  color: '#fff',
  marginBottom: theme.space.md,
};

const blurbStyle: CSSProperties = {
  fontSize: theme.size.small,
  color: theme.color.textMuted,
  lineHeight: 1.6,
  fontStyle: 'italic',
  marginBottom: theme.space.xl,
};

const listStyle: CSSProperties = { display: 'flex', flexDirection: 'column', gap: theme.space.lg };

const cardStyle: CSSProperties = {
  background: theme.color.bgRaised,
  border: '1px solid',
  padding: theme.space.xl,
};

const factionNameStyle: CSSProperties = {
  fontFamily: theme.font.display,
  fontSize: theme.size.h1,
  letterSpacing: theme.letter.wide,
};

const mottoStyle: CSSProperties = {
  fontFamily: theme.font.body,
  fontStyle: 'italic',
  fontSize: theme.size.small,
  color: theme.color.textMuted,
  marginTop: 4,
  marginBottom: theme.space.md,
};

const longDescStyle: CSSProperties = {
  fontSize: theme.size.small,
  lineHeight: 1.6,
  color: theme.color.text,
};

const metaStyle: CSSProperties = {
  marginTop: theme.space.md,
  display: 'flex',
  flexDirection: 'column',
  gap: 4,
};

const metaLineStyle: CSSProperties = { display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' };

const metaLabelStyle: CSSProperties = {
  fontFamily: theme.font.mono,
  fontSize: theme.size.micro,
  color: theme.color.textDim,
  letterSpacing: theme.letter.wide,
  minWidth: 60,
};

const metaValueStyle: CSSProperties = {
  fontFamily: theme.font.mono,
  fontSize: theme.size.tiny,
  color: theme.color.info,
};

const typeChipStyle: CSSProperties = {
  fontFamily: theme.font.mono,
  fontSize: theme.size.micro,
  letterSpacing: theme.letter.normal,
  padding: '2px 6px',
  border: '1px solid',
  borderRadius: 2,
};
