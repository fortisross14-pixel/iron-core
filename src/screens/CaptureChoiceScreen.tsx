/**
 * CaptureChoiceScreen — appears after winning a grind fight against a wild mecha.
 *
 * Uses the MechaCard component in 'capture' mode. Shows KEEP / SALVAGE actions
 * as part of the card overlay. Cannot be closed via the X — the player must
 * make a choice.
 */

import { useGame } from '../state/GameStore';
import { Button } from '../components/Button';
import { MechaCard } from '../components/MechaCard';
import { MODELS } from '../data/models';

export function CaptureChoiceScreen() {
  const { state, dispatch } = useGame();
  const pending = state.pendingCapture;
  if (!pending) return null;
  const model = MODELS[pending.modelId];
  if (!model) return null;

  const alreadyOwn = state.bots.some(b => b.modelId === model.id);

  return (
    <MechaCard
      mode="capture"
      modelId={model.id}
      wildLevel={pending.level}
      alreadyOwn={alreadyOwn}
      onClose={() => { /* capture is mandatory — no close */ }}
      actions={
        <>
          <Button full
            disabled={alreadyOwn}
            onClick={() => dispatch({ type: 'CAPTURE_KEEP' })}>
            KEEP — add to stable →
          </Button>
          <Button full variant="secondary"
            onClick={() => dispatch({ type: 'CAPTURE_SALVAGE' })}>
            SALVAGE for parts →
          </Button>
        </>
      }
    />
  );
}
