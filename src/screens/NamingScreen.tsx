import { CSSProperties, useState } from 'react';
import { useGame } from '../state/GameStore';
import { suggestFirstName } from '../data/names';
import { MODELS } from '../data/models';
import { theme } from '../styles/theme';
import { Button } from '../components/Button';

export function NamingScreen() {
  const { state, dispatch } = useGame();
  const modelId = state.pendingNamingModelId;
  const [firstName, setFirstName] = useState(suggestFirstName());
  if (!modelId) return null;
  const model = MODELS[modelId];

  const confirm = () => {
    dispatch({ type: 'CONFIRM_NAMING', firstName: firstName.trim() || suggestFirstName() });
  };

  return (
    <div style={wrapStyle}>
      <div style={boxStyle}>
        <div style={headerStyle}>NAME YOUR {model.surname.toUpperCase()}</div>
        <div style={blurbStyle}>
          Every Operator gives their chassis a first name.<br/>
          <em>(Surname: {model.surname})</em>
        </div>
        <input
          value={firstName}
          onChange={(e) => setFirstName(e.target.value.slice(0, 16))}
          placeholder="FIRST NAME"
          style={inputStyle}
          autoFocus
          onKeyDown={(e) => e.key === 'Enter' && firstName.trim() && confirm()}
        />
        <div style={previewStyle}>{firstName.trim() || '???'} {model.surname}</div>
        <Button variant="ghost" full small onClick={() => setFirstName(suggestFirstName())} style={{ marginTop: 12 }}>
          ↻ ROLL ANOTHER
        </Button>
        <Button full onClick={confirm} style={{ marginTop: 18 }}>
          CONFIRM
        </Button>
      </div>
    </div>
  );
}

const wrapStyle: CSSProperties = {
  minHeight: '100vh',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: theme.space.xxl,
};

const boxStyle: CSSProperties = { width: '100%', maxWidth: 400 };

const headerStyle: CSSProperties = {
  fontFamily: theme.font.display,
  fontSize: theme.size.h2,
  letterSpacing: theme.letter.wider,
  color: theme.color.accent,
  marginBottom: theme.space.lg,
};

const blurbStyle: CSSProperties = {
  color: theme.color.text,
  lineHeight: 1.6,
  fontSize: theme.size.small,
  marginBottom: theme.space.xl,
};

const inputStyle: CSSProperties = {
  width: '100%',
  padding: theme.space.lg,
  background: theme.color.bgSunken,
  border: `1px solid ${theme.color.accent}`,
  color: '#fff',
  fontSize: 18,
  fontFamily: theme.font.display,
  letterSpacing: theme.letter.wider,
  textAlign: 'center',
  outline: 'none',
};

const previewStyle: CSSProperties = {
  textAlign: 'center',
  marginTop: theme.space.lg,
  fontFamily: theme.font.display,
  fontSize: theme.size.h2,
  letterSpacing: theme.letter.wide,
  color: theme.color.accent,
};
