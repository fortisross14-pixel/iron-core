import { CSSProperties, ReactNode } from 'react';
import { theme } from '../styles/theme';
import { useGame } from '../state/GameStore';
import { TOTAL_DEX } from '../data/models';
import { FACTIONS } from '../data/factions';

interface Props {
  children: ReactNode;
  showHeader?: boolean;
  showFooter?: boolean;
  footer?: ReactNode;
}

/**
 * Outer chrome of the app. Wraps every screen.
 * If you reskin the game, this is the first place to touch.
 */
export function Shell({ children, showHeader = true, showFooter = false, footer }: Props) {
  const { state } = useGame();
  const faction = state.factionId ? FACTIONS[state.factionId] : null;

  return (
    <div style={appStyle}>
      {showHeader && (
        <header style={headerStyle}>
          <div style={brandStyle}>
            <span style={brandMarkStyle}>◆</span>
            <span style={brandTextStyle}>IRON&nbsp;CORE</span>
            <span style={versionStyle}>v0.91</span>
          </div>
          <div style={headerStatsStyle}>
            {faction && (
              <div style={{ ...statStyle, alignItems: 'flex-end' }}>
                <span style={statLabelStyle}>FACTION</span>
                <span style={{ ...statValueStyle, color: theme.factionColor[faction.id], fontSize: theme.size.small }}>
                  {faction.shortName}
                </span>
              </div>
            )}
            <div style={statStyle}>
              <span style={statLabelStyle}>CR</span>
              <span style={statValueStyle}>{state.money.toLocaleString()}</span>
            </div>
            <div style={statStyle}>
              <span style={statLabelStyle}>DEX</span>
              <span style={statValueStyle}>{state.discovered.size}/{TOTAL_DEX}</span>
            </div>
          </div>
        </header>
      )}
      <main style={mainStyle}>{children}</main>
      {showFooter && footer && (
        <nav style={footerStyle}>{footer}</nav>
      )}
    </div>
  );
}

const appStyle: CSSProperties = {
  minHeight: '100vh',
  background: 'radial-gradient(ellipse at top, #15151a 0%, #050507 60%, #000 100%)',
  color: theme.color.text,
  fontFamily: theme.font.body,
  display: 'flex',
  flexDirection: 'column',
  maxWidth: theme.maxWidth,
  margin: '0 auto',
  position: 'relative',
};

const headerStyle: CSSProperties = {
  padding: `${theme.space.lg}px ${theme.space.xl}px ${theme.space.md}px`,
  borderBottom: `1px solid ${theme.color.accent}33`,
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  background: 'linear-gradient(180deg, rgba(255,107,53,0.08) 0%, transparent 100%)',
};

const brandStyle: CSSProperties = { display: 'flex', alignItems: 'baseline', gap: 8 };

const versionStyle: CSSProperties = {
  fontFamily: theme.font.mono,
  fontSize: theme.size.micro,
  color: theme.color.textDim,
  letterSpacing: theme.letter.wide,
};

const brandMarkStyle: CSSProperties = {
  color: theme.color.accent,
  fontSize: 18,
  textShadow: `0 0 12px ${theme.color.accent}`,
};

const brandTextStyle: CSSProperties = {
  fontFamily: theme.font.display,
  fontSize: theme.size.h1,
  letterSpacing: theme.letter.wider,
  color: '#fff',
};

const headerStatsStyle: CSSProperties = { display: 'flex', gap: 14, alignItems: 'flex-end' };

const statStyle: CSSProperties = { display: 'flex', flexDirection: 'column', alignItems: 'flex-end' };

const statLabelStyle: CSSProperties = {
  fontFamily: theme.font.mono,
  fontSize: theme.size.micro,
  color: theme.color.textMuted,
  letterSpacing: theme.letter.wide,
};

const statValueStyle: CSSProperties = {
  fontFamily: theme.font.mono,
  fontSize: theme.size.h3,
  color: theme.color.accent,
  fontWeight: 800,
};

const mainStyle: CSSProperties = {
  flex: 1,
  padding: theme.space.xl,
  paddingBottom: 90,
  overflowY: 'auto',
};

const footerStyle: CSSProperties = {
  position: 'fixed',
  bottom: 0,
  left: '50%',
  transform: 'translateX(-50%)',
  width: '100%',
  maxWidth: theme.maxWidth,
  display: 'flex',
  background: theme.color.bgRaised,
  borderTop: `1px solid ${theme.color.accent}4d`,
  zIndex: theme.z.tabs,
};
