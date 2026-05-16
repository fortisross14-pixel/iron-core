import { CSSProperties } from 'react';
import { useGame } from '../state/GameStore';
import { LOCATIONS } from '../data/locations';
import { theme } from '../styles/theme';
import { Shell } from '../components/Shell';
import { Button } from '../components/Button';
import { useStoryTriggers } from '../hooks/useStoryTriggers';

import { HomeLocationView } from './locations/HomeLocationView';
import { WorkshopLocationView } from './locations/WorkshopLocationView';
import { MarketLocationView } from './locations/MarketLocationView';
import { GateLocationView } from './locations/GateLocationView';
import { JunkyardLocationView } from './locations/JunkyardLocationView';
import { AcademyLocationView } from './locations/AcademyLocationView';
import { TournamentHallLocationView } from './locations/TournamentHallLocationView';
import { FactionHouseLocationView } from './locations/FactionHouseLocationView';
import { SquareLocationView } from './locations/SquareLocationView';

/**
 * LocationScreen routes to a sub-view based on the location's `kind`.
 * Each sub-view is a small component file in screens/locations/.
 */
export function LocationScreen() {
  const { state, dispatch } = useGame();
  useStoryTriggers();

  const locId = state.currentLocationId;
  const loc = locId ? LOCATIONS[locId] : null;
  if (!loc) return null;

  return (
    <Shell>
      <button
        onClick={() => dispatch({ type: 'LEAVE_LOCATION' })}
        style={backStyle}>← BACK TO TOWN</button>

      <div style={titleStyle}>{loc.name}</div>
      <div style={descStyle}>{loc.desc}</div>

      <div style={contentStyle}>
        {loc.kind === 'home' && <HomeLocationView locationId={loc.id} />}
        {loc.kind === 'workshop' && <WorkshopLocationView locationId={loc.id} />}
        {loc.kind === 'market' && <MarketLocationView locationId={loc.id} />}
        {loc.kind === 'gate' && <GateLocationView locationId={loc.id} />}
        {loc.kind === 'junkyard' && <JunkyardLocationView locationId={loc.id} />}
        {loc.kind === 'academy' && <AcademyLocationView locationId={loc.id} />}
        {loc.kind === 'tournament_hall' && <TournamentHallLocationView locationId={loc.id} />}
        {loc.kind === 'faction_house' && <FactionHouseLocationView locationId={loc.id} />}
        {loc.kind === 'square' && <SquareLocationView locationId={loc.id} />}
      </div>
    </Shell>
  );
}

const backStyle: CSSProperties = {
  background: 'transparent',
  border: 'none',
  color: theme.color.textMuted,
  fontFamily: theme.font.mono,
  fontSize: theme.size.tiny,
  letterSpacing: theme.letter.wide,
  cursor: 'pointer',
  padding: 0,
  marginBottom: theme.space.md,
};

const titleStyle: CSSProperties = {
  fontFamily: theme.font.display,
  fontSize: theme.size.h1,
  letterSpacing: theme.letter.wider,
  color: '#fff',
};

const descStyle: CSSProperties = {
  fontFamily: theme.font.body,
  fontStyle: 'italic',
  fontSize: theme.size.small,
  color: theme.color.textMuted,
  lineHeight: 1.6,
  marginTop: theme.space.sm,
  marginBottom: theme.space.xl,
  paddingLeft: theme.space.md,
  borderLeft: `2px solid ${theme.color.accent}`,
};

const contentStyle: CSSProperties = { display: 'flex', flexDirection: 'column', gap: theme.space.md };
