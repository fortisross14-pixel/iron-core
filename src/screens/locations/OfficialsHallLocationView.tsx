/**
 * OfficialsHallLocationView — hosts tier tests + elite tournaments.
 *
 * Tier tests (e.g. Official Test) gate tier progression.
 * Elite tournaments (Inter-Faction, Ultimate) are hosted here for now.
 */

import { CSSProperties } from 'react';
import { TIER_TESTS } from '../../data/tests';
import { TOURNAMENTS } from '../../data/tournaments';
import { MultiFightEventView } from '../../components/MultiFightEventView';
import { theme } from '../../styles/theme';

export function OfficialsHallLocationView({ locationId }: { locationId: string }) {
  const tests = Object.values(TIER_TESTS).filter(t => t.hostLocationId === locationId);
  const tournaments = Object.values(TOURNAMENTS).filter(t => t.hostLocationId === locationId);
  const all = [...tests, ...tournaments];

  return (
    <div>
      <div style={hintStyle}>
        The reception desk is staffed by a woman in a stiff black blazer. The brass plaques behind her list every Official trainer of the last decade.
      </div>
      {all.map(t => (
        <div key={t.id} style={{ marginBottom: theme.space.md }}>
          <MultiFightEventView event={t} />
        </div>
      ))}
      {all.length === 0 && (
        <div style={emptyStyle}>The receptionist looks up briefly. "No events are scheduled here right now."</div>
      )}
    </div>
  );
}

const hintStyle: CSSProperties = {
  fontSize: theme.size.small, color: theme.color.text,
  lineHeight: 1.6, marginBottom: theme.space.md, fontStyle: 'italic',
};

const emptyStyle: CSSProperties = {
  fontSize: theme.size.small, color: theme.color.textDim,
  textAlign: 'center', padding: theme.space.lg, fontStyle: 'italic',
};
