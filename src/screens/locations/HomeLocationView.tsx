import { CSSProperties } from 'react';
import { useGame } from '../../state/GameStore';
import { Button } from '../../components/Button';
import { theme } from '../../styles/theme';

export function HomeLocationView({ locationId }: { locationId: string }) {
  const { state, dispatch } = useGame();
  return (
    <div>
      <div style={hintStyle}>You can't sleep here yet. Soon — save points will go here.</div>
      <Button variant="ghost" full small onClick={() => dispatch({ type: 'OPEN_DIALOG', sceneId: 'home_morning' })}>
        LOOK AROUND
      </Button>
    </div>
  );
}

const hintStyle: CSSProperties = {
  fontSize: theme.size.small,
  color: theme.color.textMuted,
  fontStyle: 'italic',
  marginBottom: theme.space.md,
};
