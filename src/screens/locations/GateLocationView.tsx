import { CSSProperties } from 'react';
import { useGame } from '../../state/GameStore';
import { Button } from '../../components/Button';
import { theme } from '../../styles/theme';
import { xpRewardForTrainer } from '../../game/fame';
import type { PendingBattle } from '../../state/types';

export function GateLocationView({ locationId }: { locationId: string }) {
  const { state, dispatch } = useGame();
  const defeatedOnce = state.storyFlags.has('krait_defeated_player');
  const rematchWon = state.storyFlags.has('krait_rematch_won');
  const hasBot = state.bots.length > 0;

  const fightFirst = () => {
    const battle: PendingBattle = {
      source: 'trainer',
      sourceId: 'krait_first_fight',
      trainerId: 'krait',
      oppLevel: 3, oppRank: 'competitor',
      teamSize: 2,
      forceModelId: 'scrap_grunt',
      forceFirstName: 'Krait',
      prize: 0,
      xpReward: xpRewardForTrainer('krait'),
      // first fight is designed to be a loss (he's tougher than you).
      // either way, after the fight: dialog krait_lost → unlock junkyard.
      // we only fire krait_lost on actual loss; on win, skip directly to rematch.
      onLossSceneId: 'krait_lost',
      onWinSceneId: 'krait_won',
      onLossFlags: ['krait_first_fought'],
      onWinFlags: ['krait_first_fought', 'krait_rematch_won'],
      unlockCityId: 'voltspire',
    };
    dispatch({ type: 'QUEUE_BATTLE', battle });
  };

  const rematch = () => {
    const battle: PendingBattle = {
      source: 'trainer',
      sourceId: 'krait_rematch',
      trainerId: 'krait',
      oppLevel: 3, oppRank: 'competitor',
      teamSize: 2,
      forceModelId: 'scrap_grunt',
      forceFirstName: 'Krait',
      prize: 300,
      xpReward: xpRewardForTrainer('krait') * 2,  // rematch grants double for the second harder fight
      onWinSceneId: 'krait_won',
      onWinFlags: ['krait_rematch_won'],
      unlockCityId: 'voltspire',
    };
    dispatch({ type: 'QUEUE_BATTLE', battle });
  };

  if (rematchWon) {
    return (
      <div style={hintStyle}>
        Krait nods to you as you pass. The road east is yours.
      </div>
    );
  }

  if (defeatedOnce) {
    return (
      <div>
        <div style={hintStyle}>
          Krait leans against the gate post. "Back for another go? Train at the junkyard first if you haven't."
        </div>
        <Button full disabled={!hasBot} onClick={rematch}>
          REMATCH KRAIT →
        </Button>
      </div>
    );
  }

  return (
    <div>
      <div style={hintStyle}>
        Krait stands in the road. He hasn't moved.
      </div>
      <Button full disabled={!hasBot} onClick={fightFirst}>
        APPROACH HIM
      </Button>
      {!hasBot && <div style={warnStyle}>You need a bot. Visit your uncle.</div>}
    </div>
  );
}

const hintStyle: CSSProperties = {
  fontSize: theme.size.small,
  color: theme.color.text,
  lineHeight: 1.6,
  marginBottom: theme.space.md,
};

const warnStyle: CSSProperties = {
  fontSize: theme.size.tiny,
  color: theme.color.danger,
  marginTop: theme.space.sm,
  fontStyle: 'italic',
};
