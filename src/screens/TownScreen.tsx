import { CSSProperties } from 'react';
import { useGame } from '../state/GameStore';
import { CITIES, LOCATIONS, LOCATIONS_BY_CITY, LocationData, LocationKind } from '../data/locations';
import { theme } from '../styles/theme';
import { Shell } from '../components/Shell';
import { Button } from '../components/Button';

const KIND_ICON: Record<LocationKind, string> = {
  home: '⌂', workshop: '⚙', market: '☉', gate: '⌷',
  junkyard: '◌', academy: '⌬', tournament_hall: '◇',
  faction_house: '◈', square: '◯', guild: '◑',
};

export function TownScreen() {
  const { state, dispatch } = useGame();
  const city = CITIES[state.currentCityId];
  const locations = LOCATIONS_BY_CITY(state.currentCityId);

  const isUnlocked = (loc: LocationData): boolean => {
    const r = loc.requires;
    if (r.storyFlags?.some(f => !state.storyFlags.has(f))) return false;
    if (r.location && !state.storyFlags.has(`visited_${r.location}`)) {
      // soft requirement — for now we use flags
    }
    return true;
  };

  // city switcher
  const switchableCities = [...state.unlockedCities].filter(id => id !== state.currentCityId);

  return (
    <Shell>
      <div style={titleStyle}>{city.name}</div>
      <div style={subtitleStyle}>{city.region} · {city.desc}</div>

      {switchableCities.length > 0 && (
        <div style={switcherStyle}>
          {switchableCities.map(cid => (
            <Button key={cid} variant="secondary" small onClick={() => dispatch({ type: 'SWITCH_CITY', cityId: cid })}>
              → {CITIES[cid].name}
            </Button>
          ))}
        </div>
      )}

      <div style={listStyle}>
        {locations.map(loc => {
          const unlocked = isUnlocked(loc);
          return (
            <button
              key={loc.id}
              onClick={() => unlocked && dispatch({ type: 'ENTER_LOCATION', locationId: loc.id })}
              disabled={!unlocked}
              style={{
                ...rowStyle,
                ...(unlocked ? {} : lockedStyle),
                ...(loc.factionAlignment ? { borderLeft: `3px solid ${theme.factionColor[loc.factionAlignment]}` } : {}),
              }}>
              <div style={iconStyle}>{KIND_ICON[loc.kind]}</div>
              <div style={textStyle}>
                <div style={nameStyle}>{unlocked ? loc.name : '???'}</div>
                <div style={tagStyle}>{unlocked ? loc.shortDesc : 'Locked'}</div>
              </div>
              <div style={chevronStyle}>{unlocked ? '→' : '🔒'}</div>
            </button>
          );
        })}
      </div>
    </Shell>
  );
}

const titleStyle: CSSProperties = {
  fontFamily: theme.font.display,
  fontSize: theme.size.h1,
  letterSpacing: theme.letter.widest,
  color: '#fff',
};

const subtitleStyle: CSSProperties = {
  fontFamily: theme.font.mono,
  fontSize: theme.size.tiny,
  color: theme.color.textMuted,
  letterSpacing: theme.letter.wide,
  marginTop: 4,
  marginBottom: theme.space.lg,
};

const switcherStyle: CSSProperties = {
  display: 'flex',
  gap: theme.space.sm,
  marginBottom: theme.space.lg,
  flexWrap: 'wrap',
};

const listStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: theme.space.sm,
};

const rowStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: theme.space.lg,
  background: theme.color.bgRaised,
  border: `1px solid ${theme.color.border}`,
  padding: theme.space.lg,
  color: theme.color.text,
  textAlign: 'left',
  cursor: 'pointer',
  transition: 'all 0.15s',
};

const lockedStyle: CSSProperties = { opacity: 0.35, cursor: 'not-allowed' };

const iconStyle: CSSProperties = {
  fontFamily: theme.font.display,
  fontSize: 24,
  color: theme.color.accent,
  width: 32,
  textAlign: 'center',
};

const textStyle: CSSProperties = { flex: 1 };

const nameStyle: CSSProperties = {
  fontFamily: theme.font.display,
  fontSize: theme.size.h3,
  letterSpacing: theme.letter.wide,
  color: '#fff',
};

const tagStyle: CSSProperties = {
  fontFamily: theme.font.mono,
  fontSize: theme.size.tiny,
  color: theme.color.textMuted,
  marginTop: 2,
  letterSpacing: theme.letter.tight,
};

const chevronStyle: CSSProperties = {
  fontSize: 18,
  color: theme.color.accent,
};
