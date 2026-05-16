/**
 * OfficialsHallLocationView — hosts tier tests.
 *
 * Currently: Official Test only.
 * In the future, this same view will also host the Professional Test if
 * relocated here, or it can be a different hall in another city.
 */

import { CSSProperties } from 'react';
import { TIER_TESTS } from '../../data/tests';
import { MultiFightEventView } from '../../components/MultiFightEventView';
import { theme } from '../../styles/theme';

export function OfficialsHallLocationView({ locationId }: { locationId: string }) {
  const here = Object.values(TIER_TESTS).filter(t => t.hostLocationId === locationId);

  return (
    <div>
      <div style={hintStyle}>
        The reception desk is staffed by a woman in a stiff black blazer. The brass plaques behind her list every Official trainer of the last decade.
      </div>
      {here.map(t => (
        <div key={t.id} style={{ marginBottom: theme.space.md }}>
          <MultiFightEventView event={t} />
        </div>
      ))}
      {here.length === 0 && (
        <div style={emptyStyle}>The receptionist looks up briefly. "No tests are scheduled for your tier at this hall."</div>
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
