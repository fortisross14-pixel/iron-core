import { CSSProperties } from 'react';
import { useGame } from '../../state/GameStore';
import { Button } from '../../components/Button';
import { theme } from '../../styles/theme';

export function WorkshopLocationView({ locationId }: { locationId: string }) {
  const { state, dispatch } = useGame();
  const gotGift = state.storyFlags.has('uncle_gift_received');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: theme.space.md }}>
      {gotGift ? (
        <>
          <div style={hintStyle}>
            Your uncle is bent over a workbench, soldering. He looks up. "Need a tune-up? On the house."
          </div>
          <Button full onClick={() => dispatch({ type: 'WORKSHOP_FULL_HEAL' })}>
            FULL REPAIR & RECHARGE (FREE) →
          </Button>
          <div style={smallNoteStyle}>
            Restores all roster mechas to full HP and battery. Use before tournaments.
          </div>
          <Button variant="secondary" full onClick={() => dispatch({ type: 'GO_SCENE', scene: 'stable' })}>
            VIEW YOUR STABLE
          </Button>
        </>
      ) : (
        <div style={hintStyle}>Your uncle's voice echoes from the back. "Come on in. I have something for you."</div>
      )}
    </div>
  );
}

const hintStyle: CSSProperties = {
  fontSize: theme.size.small,
  color: theme.color.text,
  lineHeight: 1.6,
};

const smallNoteStyle: CSSProperties = {
  fontSize: theme.size.tiny,
  color: theme.color.textDim,
  fontStyle: 'italic',
  textAlign: 'center',
  marginTop: -4,
};
