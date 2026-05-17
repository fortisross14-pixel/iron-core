/**
 * Shell — outer chrome of the app.
 *
 * Tints adapt to the active city palette. Top bar shows:
 *   - Brand mark + IRON CORE wordmark
 *   - Bracketed page label (e.g. [ STABLE ])
 *   - Right side: CR / DEX / FACTION stats + connection stamp
 *
 * Bottom-left of the screen gets a tiny version stamp + page indicator like
 * the Cyberpunk references.
 */

import { CSSProperties, ReactNode } from 'react';
import { theme } from '../styles/theme';
import { useCityPalette } from '../styles/cityPalette';
import { useGame } from '../state/GameStore';
import { TOTAL_DEX } from '../data/models';
import { FACTIONS } from '../data/factions';
import { CITIES } from '../data/cities';
import { ConnectionStamp, BracketLabel } from './Frame';

interface Props {
  children: ReactNode;
  showHeader?: boolean;
  showFooter?: boolean;
  footer?: ReactNode;
  /** Override the bracketed label shown next to the brand. */
  pageLabel?: string;
}

export function Shell({ children, showHeader = true, showFooter = false, footer, pageLabel }: Props) {
  const { state } = useGame();
  const palette = useCityPalette();
  const faction = state.factionId ? FACTIONS[state.factionId] : null;
  const city = state.currentCityId ? CITIES[state.currentCityId] : null;

  const appStyle: CSSProperties = {
    minHeight: '100vh',
    background: `
      radial-gradient(ellipse at 50% -10%, ${palette.c5}80 0%, transparent 50%),
      linear-gradient(180deg, ${theme.color.bg} 0%, #000 100%)
    `,
    color: theme.color.text,
    fontFamily: theme.font.body,
    display: 'flex',
    flexDirection: 'column',
    maxWidth: theme.maxWidth,
    margin: '0 auto',
    position: 'relative',
  };

  const headerStyle: CSSProperties = {
    padding: `${theme.space.md}px ${theme.space.lg}px ${theme.space.sm}px`,
    borderBottom: `1px solid ${palette.c1}50`,
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
    background: `linear-gradient(180deg, ${palette.c5}40 0%, transparent 100%)`,
    position: 'relative',
  };

  const headerLine1Style: CSSProperties = {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
  };

  const headerLine2Style: CSSProperties = {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
  };

  const brandStyle: CSSProperties = { display: 'flex', alignItems: 'baseline', gap: 8 };

  const brandMarkStyle: CSSProperties = {
    color: palette.c1,
    fontSize: 18,
    textShadow: `0 0 12px ${palette.c1}`,
  };

  const brandTextStyle: CSSProperties = {
    fontFamily: theme.font.display,
    fontSize: theme.size.h2,
    letterSpacing: theme.letter.wider,
    color: '#fff',
  };

  const versionStyle: CSSProperties = {
    fontFamily: theme.font.mono,
    fontSize: theme.size.micro,
    color: palette.c4,
    letterSpacing: theme.letter.wide,
  };

  const headerStatsStyle: CSSProperties = { display: 'flex', gap: 14, alignItems: 'flex-end' };

  const statStyle: CSSProperties = { display: 'flex', flexDirection: 'column', alignItems: 'flex-end' };

  const statLabelStyle: CSSProperties = {
    fontFamily: theme.font.mono,
    fontSize: theme.size.micro,
    color: palette.c4,
    letterSpacing: theme.letter.wide,
  };

  const statValueStyle: CSSProperties = {
    fontFamily: theme.font.mono,
    fontSize: theme.size.small,
    color: palette.c2,
    fontWeight: 800,
  };

  const mainStyle: CSSProperties = {
    flex: 1,
    padding: theme.space.lg,
    paddingBottom: 90,
    overflowY: 'auto',
    position: 'relative',
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
    borderTop: `1px solid ${palette.c1}80`,
    zIndex: theme.z.tabs,
  };

  return (
    <div style={appStyle}>
      {showHeader && (
        <header style={headerStyle}>
          <div style={headerLine1Style}>
            <div style={brandStyle}>
              <span style={brandMarkStyle}>◆</span>
              <span style={brandTextStyle}>IRON&nbsp;CORE</span>
              <span style={versionStyle}>v1.00</span>
            </div>
            <div style={headerStatsStyle}>
              {faction && (
                <div style={statStyle}>
                  <span style={statLabelStyle}>FACTION</span>
                  <span style={{ ...statValueStyle, color: theme.factionColor[faction.id] }}>
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
          </div>
          <div style={headerLine2Style}>
            {pageLabel !== '' && (
              <BracketLabel>{pageLabel ?? (city ? city.name.toUpperCase() : 'IRON CORE')}</BracketLabel>
            )}
            <ConnectionStamp seed={state.currentCityId ?? 'sys'} />
          </div>
        </header>
      )}
      <main style={mainStyle}>{children}</main>
      {showFooter && footer && <nav style={footerStyle}>{footer}</nav>}
    </div>
  );
}
