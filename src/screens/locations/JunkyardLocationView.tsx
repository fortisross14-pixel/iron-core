import { CSSProperties } from 'react';
import { useGame } from '../../state/GameStore';
import { Button } from '../../components/Button';
import { theme } from '../../styles/theme';
import type { PendingBattle } from '../../state/types';

export function JunkyardLocationView({ locationId }: { locationId: string }) {
  const { state, dispatch } = useGame();
  const hasBot = state.bots.length > 0;

  const fight = () => {
    const playerLvl = Math.max(...state.bots.map(b => b.level), 1);
    const battle: PendingBattle = {
      source: 'junkyard',
      sourceId: 'wild_skirmish',
      oppLevel: Math.max(1, playerLvl - 1),
      oppRank: 'rookie',
      teamSize: 1,
      prize: 30,
      xpReward: 35,
      isWild: true,
    };
    dispatch({ type: 'QUEUE_BATTLE', battle });
  };

  return (
    <div>
      <div style={hintStyle}>
        The scrap field stretches out under low sun. Movement in the wreckage.
      </div>
      <div style={statsStyle}>
        Wins here: <strong>{state.achievements.junkyardWins}</strong>
      </div>
      <Button full disabled={!hasBot} onClick={fight}>
        ENGAGE A WILD MECHA →
      </Button>
      <div style={smallHint}>
        Wild mechs drop materials. Sell them at the market for credits.
      </div>
    </div>
  );
}

const hintStyle: CSSProperties = {
  fontSize: theme.size.small,
  color: theme.color.text,
  lineHeight: 1.6,
  marginBottom: theme.space.md,
};

const statsStyle: CSSProperties = {
  fontFamily: theme.font.mono,
  fontSize: theme.size.small,
  color: theme.color.textMuted,
  marginBottom: theme.space.md,
};

const smallHint: CSSProperties = {
  fontSize: theme.size.tiny,
  color: theme.color.textDim,
  fontStyle: 'italic',
  marginTop: theme.space.md,
  lineHeight: 1.5,
};
