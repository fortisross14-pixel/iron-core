/**
 * MAP TAB — Two-level navigation.
 *
 * Level 1 (WORLD): list of cities. Each city row uses its OWN palette colors
 * (so you see "this city is amber, this one is cyan, this one is magenta")
 * even when you're not in it.
 *
 * Level 2 (CITY): list of places in the current city. The whole UI is already
 * tinted by the active city palette via CityPaletteProvider.
 *
 * Travel: 1.5s "TRAVELING..." with neutral grey. On arrival, palette swaps
 * instantly to the destination color (which is the new active palette).
 */

import { CSSProperties, useState } from 'react';
import { useGame } from '../state/GameStore';
import { CITIES, CITY_LIST, CITY_TIER_LABEL, type CityTier } from '../data/cities';
import { placesForCity } from '../data/places';
import type { Place } from '../data/places';
import { TOURNAMENTS } from '../data/tournaments';
import { TIER_LABEL } from '../game/tier';
import { theme, CITY_PALETTES, NEUTRAL_PALETTE } from '../styles/theme';
import { useCityPalette, PaletteOverride } from '../styles/cityPalette';
import { Shell } from '../components/Shell';
import { Frame, BracketLabel, EdgeBand } from '../components/Frame';

type View = 'world' | 'city';

export function TownScreen() {
  const { state, dispatch } = useGame();
  const palette = useCityPalette();
  const [view, setView] = useState<View>('city');
  const [traveling, setTraveling] = useState<string | null>(null);

  const goToCity = (cityId: string) => {
    if (cityId === state.currentCityId) {
      setView('city');
      return;
    }
    setTraveling(cityId);
    setTimeout(() => {
      dispatch({ type: 'SWITCH_CITY', cityId });
      setTraveling(null);
      setView('city');
    }, 1500);
  };

  // ---- Travel animation overlay (neutral palette) ----
  if (traveling) {
    const dest = CITIES[traveling];
    return (
      <PaletteOverride palette={NEUTRAL_PALETTE}>
        <Shell pageLabel="IN TRANSIT">
          <div style={travelWrapStyle}>
            <div style={travelSpinnerStyle}>◆</div>
            <div style={travelTextStyle}>SIGNAL LOST · TRAVELING TO</div>
            <div style={travelCityStyle}>{dest?.name ?? '???'}</div>
            <div style={travelDotsStyle}>...</div>
          </div>
        </Shell>
      </PaletteOverride>
    );
  }

  // ---- WORLD VIEW ----
  if (view === 'world') {
    return (
      <Shell pageLabel="WORLD MAP">
        <div style={titleStyle(palette)}>WORLD MAP</div>
        <div style={subtitleStyle(palette)}>Select a city to travel.</div>

        <div style={cityListStyle}>
          {CITY_LIST.map(city => {
            const unlocked = state.unlockedCities.has(city.id);
            const isCurrent = city.id === state.currentCityId;
            // Each city row uses ITS OWN palette so you see the visual identity
            const cityPalette = CITY_PALETTES[city.id] ?? NEUTRAL_PALETTE;

            return (
              <button key={city.id}
                onClick={() => unlocked && goToCity(city.id)}
                disabled={!unlocked}
                style={{
                  ...cityRowStyle,
                  background: unlocked ? `linear-gradient(90deg, ${cityPalette.c5}c0 0%, ${theme.color.bgRaised} 70%)` : theme.color.bgRaised,
                  border: `1px solid ${unlocked ? cityPalette.c1 : theme.color.border}80`,
                  opacity: unlocked ? 1 : 0.4,
                  cursor: unlocked ? 'pointer' : 'not-allowed',
                  boxShadow: isCurrent ? `0 0 16px ${cityPalette.c1}80, inset 0 0 0 1px ${cityPalette.c1}` : 'none',
                }}>
                {/* Corner brackets per-row */}
                {unlocked && (
                  <>
                    <span style={cornerTL(cityPalette.c1)} />
                    <span style={cornerTR(cityPalette.c1)} />
                    <span style={cornerBL(cityPalette.c1)} />
                    <span style={cornerBR(cityPalette.c1)} />
                  </>
                )}
                <div style={{ ...cityIconStyle, color: unlocked ? cityPalette.c1 : theme.color.textDim, textShadow: unlocked ? `0 0 12px ${cityPalette.c1}` : 'none' }}>
                  {cityIconForTier(city.tier)}
                </div>
                <div style={cityBodyStyle}>
                  <div style={cityNameStyle}>
                    {unlocked ? city.name : '??? ???'}
                    {unlocked && (
                      <span style={{ ...cityTierBadgeStyle, color: cityPalette.c2, borderColor: cityPalette.c1 }}>
                        {CITY_TIER_LABEL[city.tier]}
                      </span>
                    )}
                  </div>
                  <div style={cityDescStyle}>
                    {unlocked ? city.region : 'Not yet discovered.'}
                  </div>
                </div>
                {isCurrent && (
                  <div style={{ ...youAreHereStyle, color: cityPalette.c1 }}>YOU ARE HERE</div>
                )}
              </button>
            );
          })}
        </div>
      </Shell>
    );
  }

  // ---- CITY VIEW ----
  const city = CITIES[state.currentCityId];
  const places = placesForCity(state.currentCityId);

  const isUnlocked = (p: Place): boolean => {
    const flags = p.requires?.storyFlags;
    if (flags?.some(f => !state.storyFlags.has(f))) return false;
    return true;
  };

  return (
    <Shell pageLabel={city.name.toUpperCase()}>
      <button onClick={() => setView('world')} style={backStyle(palette)}>← WORLD MAP</button>

      <div style={cityHeaderStyle}>
        <div>
          <div style={titleStyle(palette)}>{city.name}</div>
          <div style={{ ...subtitleStyle(palette), marginTop: 2 }}>{city.region}</div>
        </div>
        <span style={{ ...cityTierBadgeStyle, color: palette.c2, borderColor: palette.c1 }}>
          {CITY_TIER_LABEL[city.tier]}
        </span>
      </div>
      <EdgeBand color={palette.c1} />
      <div style={{ ...subtitleStyle(palette), marginTop: theme.space.sm, marginBottom: theme.space.md }}>
        {city.desc}
      </div>

      <div style={{ marginBottom: theme.space.sm }}>
        <BracketLabel>LOCATIONS · {places.filter(p => isUnlocked(p)).length}/{places.length}</BracketLabel>
      </div>

      <div style={listStyle}>
        {places.map(p => {
          const unlocked = isUnlocked(p);
          const isFaction = p.kind === 'faction_house';
          const factionColor = isFaction ? theme.factionColor[p.factionId] : undefined;
          const accent = factionColor ?? palette.c1;

          return (
            <button
              key={p.id}
              onClick={() => unlocked && dispatch({ type: 'ENTER_LOCATION', locationId: p.id })}
              disabled={!unlocked}
              style={{
                ...rowStyle,
                opacity: unlocked ? 1 : 0.4,
                cursor: unlocked ? 'pointer' : 'not-allowed',
                background: unlocked
                  ? `linear-gradient(90deg, ${palette.c5}60 0%, ${theme.color.bgRaised} 80%)`
                  : theme.color.bgRaised,
                borderLeft: `3px solid ${unlocked ? accent : theme.color.border}`,
                border: `1px solid ${theme.color.border}`,
                borderLeftWidth: 3,
                borderLeftColor: unlocked ? accent : theme.color.border,
              }}>
              {unlocked && (
                <>
                  <span style={cornerTR(palette.c1, 6)} />
                  <span style={cornerBL(palette.c1, 6)} />
                </>
              )}
              <div style={{ ...iconStyle, color: accent, textShadow: unlocked ? `0 0 10px ${accent}80` : 'none' }}>
                {kindIcon(p.kind)}
              </div>
              <div style={bodyStyle}>
                <div style={nameStyle}>{p.name}</div>
                <div style={descStyle}>{p.shortDesc}</div>
              </div>
              <PlaceTag place={p} cityC1={palette.c1} />
            </button>
          );
        })}
      </div>
    </Shell>
  );
}

// ============================================================
// PlaceTag — small label describing the place kind
// ============================================================

function PlaceTag({ place, cityC1 }: { place: Place; cityC1: string }) {
  let label = '';
  let color: string = theme.color.textMuted;
  switch (place.kind) {
    case 'story_place':   label = 'STORY'; color = theme.color.info; break;
    case 'grind_place':   label = 'GRIND'; color = theme.color.success; break;
    case 'fight_story':   label = 'FIGHT'; color = theme.color.danger; break;
    case 'tournament': {
      const order: Array<'amateur' | 'official' | 'professional' | 'elite'> =
        ['amateur', 'official', 'professional', 'elite'];
      let highest: typeof order[number] | null = null;
      for (const id of place.tournamentIds) {
        const ev = TOURNAMENTS[id];
        if (!ev) continue;
        if (!highest || order.indexOf(ev.tier) > order.indexOf(highest)) {
          highest = ev.tier;
        }
      }
      label = highest ? `TOURNEY · ${TIER_LABEL[highest]}` : 'TOURNEY';
      color = highest === 'elite' ? '#ffd700'
        : highest === 'professional' ? '#5fa8ff'
        : highest === 'official' ? '#7fb069'
        : '#888';
      break;
    }
    case 'store':         label = 'STORE'; color = cityC1; break;
    case 'faction_house': label = 'FACTION'; color = theme.factionColor[place.factionId]; break;
    case 'other':         label = 'OTHER'; break;
  }
  if (!label) return null;
  return (
    <span style={{ ...tagStyle, color, borderColor: color, background: `${color}10` }}>
      {label}
    </span>
  );
}

function kindIcon(kind: Place['kind']): string {
  switch (kind) {
    case 'story_place':   return '⌂';
    case 'grind_place':   return '◌';
    case 'fight_story':   return '⌷';
    case 'tournament':    return '◇';
    case 'store':         return '☉';
    case 'faction_house': return '◈';
    case 'other':         return '◯';
  }
}

function cityIconForTier(t: CityTier): string {
  return t === 'village' ? '◯' : t === 'town' ? '◈' : '◆';
}

// ============================================================
// CORNER BRACKET HELPERS
// ============================================================

function cornerTL(color: string, size = 8): CSSProperties {
  return {
    position: 'absolute', top: -1, left: -1, width: size, height: size,
    borderTop: `2px solid ${color}`, borderLeft: `2px solid ${color}`,
    pointerEvents: 'none',
  };
}
function cornerTR(color: string, size = 8): CSSProperties {
  return {
    position: 'absolute', top: -1, right: -1, width: size, height: size,
    borderTop: `2px solid ${color}`, borderRight: `2px solid ${color}`,
    pointerEvents: 'none',
  };
}
function cornerBL(color: string, size = 8): CSSProperties {
  return {
    position: 'absolute', bottom: -1, left: -1, width: size, height: size,
    borderBottom: `2px solid ${color}`, borderLeft: `2px solid ${color}`,
    pointerEvents: 'none',
  };
}
function cornerBR(color: string, size = 8): CSSProperties {
  return {
    position: 'absolute', bottom: -1, right: -1, width: size, height: size,
    borderBottom: `2px solid ${color}`, borderRight: `2px solid ${color}`,
    pointerEvents: 'none',
  };
}

// ============================================================
// STYLES
// ============================================================

const titleStyle = (p: { c1: string }): CSSProperties => ({
  fontFamily: theme.font.display,
  fontSize: theme.size.h1,
  letterSpacing: theme.letter.wider,
  color: '#fff',
  textShadow: `0 0 14px ${p.c1}60`,
});
const subtitleStyle = (p: { c3: string }): CSSProperties => ({
  fontSize: theme.size.tiny, color: p.c3,
  marginBottom: theme.space.lg, lineHeight: 1.5, marginTop: 2,
  fontFamily: theme.font.mono, letterSpacing: theme.letter.tight,
});

const cityListStyle: CSSProperties = { display: 'flex', flexDirection: 'column', gap: 8 };
const cityRowStyle: CSSProperties = {
  display: 'grid', gridTemplateColumns: '36px 1fr auto', gap: 12, alignItems: 'center',
  padding: '14px 14px',
  textAlign: 'left', color: theme.color.text, font: 'inherit',
  width: '100%', position: 'relative',
};
const cityIconStyle: CSSProperties = { fontSize: 28, textAlign: 'center' };
const cityBodyStyle: CSSProperties = { minWidth: 0 };
const cityNameStyle: CSSProperties = {
  fontFamily: theme.font.display, fontSize: theme.size.h3,
  letterSpacing: theme.letter.wide, color: '#fff',
  display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap',
};
const cityTierBadgeStyle: CSSProperties = {
  fontFamily: theme.font.mono, fontSize: theme.size.micro,
  letterSpacing: theme.letter.wide,
  padding: '2px 6px', border: '1px solid',
};
const cityDescStyle: CSSProperties = {
  fontSize: theme.size.tiny, color: theme.color.textDim, marginTop: 2,
  fontFamily: theme.font.body,
};
const youAreHereStyle: CSSProperties = {
  fontFamily: theme.font.mono, fontSize: theme.size.micro,
  letterSpacing: theme.letter.wide,
  textAlign: 'right', flexShrink: 0,
  animation: 'ic-flicker 5s infinite',
};

const backStyle = (p: { c3: string }): CSSProperties => ({
  background: 'transparent', border: 'none', color: p.c3,
  fontFamily: theme.font.mono, fontSize: theme.size.tiny,
  letterSpacing: theme.letter.wide,
  cursor: 'pointer', padding: 0, marginBottom: theme.space.md,
});
const cityHeaderStyle: CSSProperties = {
  display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end',
  marginBottom: theme.space.sm,
};
const listStyle: CSSProperties = { display: 'flex', flexDirection: 'column', gap: 6 };
const rowStyle: CSSProperties = {
  display: 'grid', gridTemplateColumns: '28px 1fr auto', gap: 10,
  alignItems: 'center', padding: '12px 14px',
  textAlign: 'left', color: theme.color.text, font: 'inherit',
  width: '100%', position: 'relative',
};
const iconStyle: CSSProperties = { fontSize: 18, textAlign: 'center' };
const bodyStyle: CSSProperties = { minWidth: 0 };
const nameStyle: CSSProperties = {
  fontFamily: theme.font.display, fontSize: theme.size.body,
  letterSpacing: theme.letter.tight, color: '#fff',
};
const descStyle: CSSProperties = {
  fontSize: theme.size.tiny, color: theme.color.textDim, marginTop: 2,
  fontFamily: theme.font.body,
};
const tagStyle: CSSProperties = {
  fontFamily: theme.font.mono, fontSize: 9,
  letterSpacing: theme.letter.wide,
  padding: '3px 6px', border: '1px solid',
  flexShrink: 0, alignSelf: 'center',
};

const travelWrapStyle: CSSProperties = {
  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
  minHeight: '60vh', gap: 16,
};
const travelSpinnerStyle: CSSProperties = {
  fontSize: 60, color: NEUTRAL_PALETTE.c1,
  textShadow: `0 0 30px ${NEUTRAL_PALETTE.c1}`,
  animation: 'ic-spin 1.5s linear infinite',
};
const travelTextStyle: CSSProperties = {
  fontFamily: theme.font.mono, fontSize: theme.size.tiny,
  color: NEUTRAL_PALETTE.c3, letterSpacing: theme.letter.wide,
};
const travelCityStyle: CSSProperties = {
  fontFamily: theme.font.display, fontSize: theme.size.h2,
  letterSpacing: theme.letter.wider, color: '#fff',
};
const travelDotsStyle: CSSProperties = {
  fontFamily: theme.font.mono, fontSize: theme.size.h1,
  color: NEUTRAL_PALETTE.c1, letterSpacing: theme.letter.wider,
};
