import { CSSProperties } from 'react';
import { useDispatch } from '../state/GameStore';
import { theme } from '../styles/theme';
import { useCityPalette } from '../styles/cityPalette';
import { Button } from '../components/Button';
import { Frame, BracketLabel, ConnectionStamp } from '../components/Frame';

export function IntroScreen() {
  const dispatch = useDispatch();
  const palette = useCityPalette();

  const wrapStyle: CSSProperties = {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.space.xxl,
    background: `
      radial-gradient(ellipse at 50% 30%, ${palette.c5}c0 0%, transparent 60%),
      linear-gradient(180deg, ${theme.color.bg} 0%, #000 100%)
    `,
    position: 'relative',
  };

  const markStyle: CSSProperties = {
    fontSize: 60,
    color: palette.c1,
    textShadow: `0 0 30px ${palette.c1}, 0 0 60px ${palette.c1}80`,
    marginBottom: theme.space.lg,
  };

  const titleStyle: CSSProperties = {
    fontFamily: theme.font.display,
    fontSize: 56,
    letterSpacing: '10px',
    color: '#fff',
    margin: '0 0 8px',
    textShadow: `0 0 24px ${palette.c1}80, 0 0 60px ${palette.c1}40`,
  };

  const subStyle: CSSProperties = {
    fontFamily: theme.font.mono,
    fontSize: 11,
    color: palette.c2,
    letterSpacing: '4px',
    marginBottom: 36,
  };

  const blurbStyle: CSSProperties = {
    fontSize: 14,
    lineHeight: 1.7,
    color: theme.color.text,
    marginBottom: 28,
    fontFamily: theme.font.body,
  };

  return (
    <div style={wrapStyle}>
      {/* Top-left brand stamp */}
      <div style={topLeftStyle}>
        <BracketLabel>SYSTEM</BracketLabel>
        <ConnectionStamp seed="intro" />
      </div>
      {/* Top-right page number */}
      <div style={topRightStyle}>
        <span style={{ fontFamily: theme.font.mono, fontSize: theme.size.tiny, color: palette.c3, letterSpacing: theme.letter.wide }}>
          01 / 01 · BOOT
        </span>
      </div>

      <div style={innerStyle}>
        <Frame variant="corner" padding="xxl" style={{ marginBottom: theme.space.md }}>
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
        </Frame>
        <div style={footnoteStyle}>v1.00 · INITIAL RELEASE</div>
      </div>
    </div>
  );
}

const innerStyle: CSSProperties = { textAlign: 'center', maxWidth: 400, width: '100%' };
const topLeftStyle: CSSProperties = {
  position: 'absolute', top: 20, left: 24,
  display: 'flex', flexDirection: 'column', gap: 4,
};
const topRightStyle: CSSProperties = {
  position: 'absolute', top: 20, right: 24,
};
const footnoteStyle: CSSProperties = {
  marginTop: 20,
  fontFamily: theme.font.mono,
  fontSize: theme.size.micro,
  color: theme.color.textVeryDim,
  letterSpacing: theme.letter.wide,
};
