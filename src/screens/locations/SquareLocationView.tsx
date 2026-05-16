import { CSSProperties } from 'react';
import { theme } from '../../styles/theme';

export function SquareLocationView({ locationId }: { locationId: string }) {
  return (
    <div style={hintStyle}>
      The plaza is busy. The three faction houses sit on three sides of the square.
      The tournament hall is to the north. The market spills out to the south.
    </div>
  );
}

const hintStyle: CSSProperties = {
  fontSize: theme.size.small,
  color: theme.color.text,
  lineHeight: 1.6,
};
