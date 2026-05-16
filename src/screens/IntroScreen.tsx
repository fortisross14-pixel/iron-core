import { CSSProperties } from 'react';
import { useDispatch } from '../state/GameStore';
import { theme } from '../styles/theme';
import { Button } from '../components/Button';

export function IntroScreen() {
  const dispatch = useDispatch();

  return (
    <div style={wrapStyle}>
      <div style={innerStyle}>
        <div style={markStyle}>◆</div>
        <h1 style={titleStyle}>IRON CORE</h1>
        <div style={subStyle}>A SALVAGE-AGE CAREER</div>
        <div style={blurbStyle}>
          You graduate high school today.<br/>
          Your uncle's workshop is downstairs.<br/>
          The road out of town is east.
        </div>
        <Button full onClick={() => {
          dispatch({ type: 'GO_SCENE', scene: 'town' });
          dispatch({ type: 'OPEN_DIALOG', sceneId: 'prologue_open' });
        }}>
          BEGIN →
        </Button>
        <Button full variant="ghost" onClick={() => dispatch({ type: 'GO_SCENE', scene: 'town' })} style={{ marginTop: 10 }}>
          SKIP PROLOGUE (DEV)
        </Button>
        <div style={footnoteStyle}>v0.91 · STEP 3B</div>
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

const innerStyle: CSSProperties = { textAlign: 'center', maxWidth: 400, width: '100%' };

const markStyle: CSSProperties = {
  fontSize: 60,
  color: theme.color.accent,
  textShadow: `0 0 30px ${theme.color.accent}`,
  marginBottom: theme.space.lg,
};

const titleStyle: CSSProperties = {
  fontFamily: theme.font.display,
  fontSize: 52,
  letterSpacing: '8px',
  color: '#fff',
  margin: '0 0 8px',
  textShadow: `0 0 24px ${theme.color.accent}66`,
};

const subStyle: CSSProperties = {
  fontFamily: theme.font.mono,
  fontSize: 11,
  color: theme.color.textMuted,
  letterSpacing: '4px',
  marginBottom: 36,
};

const blurbStyle: CSSProperties = {
  fontSize: 14,
  lineHeight: 1.7,
  color: theme.color.textMuted,
  marginBottom: 36,
};

const footnoteStyle: CSSProperties = {
  marginTop: 28,
  fontFamily: theme.font.mono,
  fontSize: theme.size.micro,
  color: theme.color.textVeryDim,
  letterSpacing: theme.letter.wide,
};
