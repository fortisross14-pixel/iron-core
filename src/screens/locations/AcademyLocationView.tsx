import { CSSProperties } from 'react';
import { useGame } from '../../state/GameStore';
import { Button } from '../../components/Button';
import { theme } from '../../styles/theme';
import { TOURNAMENTS } from '../../data/tournaments';
import type { PendingBattle } from '../../state/types';

export function AcademyLocationView({ locationId }: { locationId: string }) {
  const { state, dispatch } = useGame();
  const t = TOURNAMENTS.senior_cup;
  const flagsOk = t.requires.storyFlags?.every(f => state.storyFlags.has(f)) ?? true;
  const hasBot = state.bots.length > 0;

  const enter = () => {
    const battle: PendingBattle = {
      source: 'tournament',
      sourceId: t.id,
      oppLevel: t.oppLevel,
      oppRank: t.oppRank,
      teamSize: t.teamSize,
      prize: t.prize,
      xpReward: t.xpReward,
    };
    dispatch({ type: 'QUEUE_BATTLE', battle });
  };

  return (
    <div>
      <div style={hintStyle}>The training yard is mostly empty. The principal has a kettle on a heater.</div>
      <div style={cardStyle}>
        <div style={nameStyle}>SENIOR CUP</div>
        <div style={descStyle}>{t.desc}</div>
        <div style={metaStyle}>1 round · solo · prize {t.prize} CR</div>
        <Button full small disabled={!flagsOk || !hasBot} onClick={enter} style={{ marginTop: 8 }}>
          {!flagsOk ? 'TALK TO THE PRINCIPAL FIRST' : 'ENTER'}
        </Button>
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

const cardStyle: CSSProperties = {
  background: theme.color.bgRaised,
  border: `1px solid ${theme.color.border}`,
  padding: theme.space.md,
};

const nameStyle: CSSProperties = {
  fontFamily: theme.font.display,
  fontSize: theme.size.h3,
  letterSpacing: theme.letter.wide,
  color: '#fff',
};

const descStyle: CSSProperties = {
  fontSize: theme.size.small,
  color: theme.color.textMuted,
  fontStyle: 'italic',
  marginTop: 4,
};

const metaStyle: CSSProperties = {
  fontFamily: theme.font.mono,
  fontSize: theme.size.tiny,
  color: theme.color.info,
  letterSpacing: theme.letter.tight,
  marginTop: 6,
};
