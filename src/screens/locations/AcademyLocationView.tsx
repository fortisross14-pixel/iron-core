import { CSSProperties } from 'react';
import { TOURNAMENTS } from '../../data/tournaments';
import { MultiFightEventView } from '../../components/MultiFightEventView';
import { theme } from '../../styles/theme';

export function AcademyLocationView({ locationId }: { locationId: string }) {
  return (
    <div>
      <div style={hintStyle}>The training yard is mostly empty. The principal has a kettle on a heater.</div>
      <MultiFightEventView event={TOURNAMENTS.senior_cup} />
    </div>
  );
}

const hintStyle: CSSProperties = {
  fontSize: theme.size.small, color: theme.color.text,
  lineHeight: 1.6, marginBottom: theme.space.md,
};
