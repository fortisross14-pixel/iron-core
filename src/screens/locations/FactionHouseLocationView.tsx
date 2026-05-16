import { CSSProperties } from 'react';
import { useGame } from '../../state/GameStore';
import { LOCATIONS } from '../../data/locations';
import { FACTIONS } from '../../data/factions';
import { Button } from '../../components/Button';
import { theme } from '../../styles/theme';

export function FactionHouseLocationView({ locationId }: { locationId: string }) {
  const { state, dispatch } = useGame();
  const loc = LOCATIONS[locationId];
  const factionId = loc.factionAlignment;
  if (!factionId) return null;
  const f = FACTIONS[factionId];
  const affiliated = state.factionId === factionId;

  return (
    <div>
      <div style={{ ...mottoStyle, color: theme.factionColor[factionId] }}>"{f.motto}"</div>
      <div style={descStyle}>{f.longDesc}</div>
      <div style={metaStyle}>
        Favored types: {f.preferredTypes.join(', ')} · Temperament: {f.temperament}
      </div>
      <Button full variant={affiliated ? 'ghost' : 'secondary'}
        onClick={() => dispatch({ type: 'GO_SCENE', scene: 'faction_pick' })}>
        {affiliated ? `✓ YOU FIGHT FOR ${f.shortName}` : 'CONSIDER AFFILIATION'}
      </Button>
    </div>
  );
}

const mottoStyle: CSSProperties = {
  fontFamily: theme.font.display,
  fontSize: theme.size.h3,
  letterSpacing: theme.letter.wide,
  marginBottom: theme.space.md,
};

const descStyle: CSSProperties = {
  fontSize: theme.size.small,
  color: theme.color.text,
  lineHeight: 1.6,
  marginBottom: theme.space.md,
};

const metaStyle: CSSProperties = {
  fontFamily: theme.font.mono,
  fontSize: theme.size.tiny,
  color: theme.color.info,
  letterSpacing: theme.letter.tight,
  marginBottom: theme.space.md,
};
