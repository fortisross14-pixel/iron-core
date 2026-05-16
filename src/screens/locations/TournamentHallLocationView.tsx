import { CSSProperties } from 'react';
import { TOURNAMENTS } from '../../data/tournaments';
import { MultiFightEventView } from '../../components/MultiFightEventView';
import { theme } from '../../styles/theme';

export function TournamentHallLocationView({ locationId }: { locationId: string }) {
  const here = Object.values(TOURNAMENTS).filter(t => t.hostLocationId === locationId);

  return (
    <div>
      <div style={hintStyle}>The walls are covered with bracket posters. Names you don't recognize.</div>
      {here.map(t => (
        <div key={t.id} style={{ marginBottom: theme.space.md }}>
          <MultiFightEventView event={t} />
        </div>
      ))}
    </div>
  );
}

const hintStyle: CSSProperties = {
  fontSize: theme.size.small, color: theme.color.text,
  lineHeight: 1.6, marginBottom: theme.space.md,
};
