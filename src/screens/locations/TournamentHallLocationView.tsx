import { CSSProperties } from 'react';
import { useGame } from '../../state/GameStore';
import { Button } from '../../components/Button';
import { theme } from '../../styles/theme';
import { TOURNAMENTS } from '../../data/tournaments';
import type { PendingBattle } from '../../state/types';

export function TournamentHallLocationView({ locationId }: { locationId: string }) {
  const { state, dispatch } = useGame();
  const here = Object.values(TOURNAMENTS).filter(t => t.hostLocationId === locationId);

  const enter = (tid: string) => {
    const t = TOURNAMENTS[tid];
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
      <div style={hintStyle}>The walls are covered with poster brackets. Names you don't recognize.</div>
      {here.map(t => {
        const ok = t.requires.storyFlags?.every(f => state.storyFlags.has(f)) ?? true;
        return (
          <div key={t.id} style={cardStyle}>
            <div style={nameStyle}>{t.name.toUpperCase()}</div>
            <div style={descStyle}>{t.desc}</div>
            <div style={metaStyle}>{t.rounds} round{t.rounds > 1 ? 's' : ''} · {t.teamSize}v{t.teamSize} · entry {t.entry} CR · prize {t.prize} CR</div>
            <Button full small disabled={!ok || state.bots.length < t.teamSize || state.money < t.entry} onClick={() => enter(t.id)} style={{ marginTop: 8 }}>
              {!ok ? 'LOCKED' : state.bots.length < t.teamSize ? `NEED ${t.teamSize} BOTS` : 'ENTER →'}
            </Button>
          </div>
        );
      })}
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
  marginBottom: 8,
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
