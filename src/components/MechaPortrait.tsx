/**
 * MechaPortrait — visual portrait for a mecha model.
 *
 * Falls back to a styled placeholder (type-colored geometric mark on a dark
 * frame). When you add real art later, the component will try to load
 * `/assets/mechas/<modelId>.png` and use it.
 *
 * Sizes:
 *   - sm  : 36px (list rows)
 *   - md  : 64px (card details)
 *   - lg  : 120px (focus panels)
 *
 * The frame has subtle corner brackets and a glow in the mecha's type color.
 */

import { CSSProperties, useState } from 'react';
import { MODELS, RARITY_INFO } from '../data/models';
import { theme } from '../styles/theme';

const SIZE_PX = { sm: 36, md: 64, lg: 120 };

interface Props {
  modelId: string;
  size?: keyof typeof SIZE_PX;
  /** When true, removes the frame chrome (for compact list rows). */
  bare?: boolean;
}

export function MechaPortrait({ modelId, size = 'md', bare = false }: Props) {
  const [imgFailed, setImgFailed] = useState(false);
  const model = MODELS[modelId];
  if (!model) return null;

  const px = SIZE_PX[size];
  const tColor = theme.typeColor[model.type] ?? theme.color.textMuted;
  const rColor = RARITY_INFO[model.rarity]?.color ?? theme.color.textMuted;

  const wrapStyle: CSSProperties = {
    width: px, height: px,
    position: 'relative',
    background: `radial-gradient(circle at center, ${tColor}30 0%, ${theme.color.bgSunken} 70%)`,
    border: bare ? 'none' : `1px solid ${tColor}80`,
    flexShrink: 0,
    overflow: 'hidden',
  };

  const imgSrc = `/iron-core/assets/mechas/${modelId}.png`;
  const showImg = !imgFailed;

  return (
    <div style={wrapStyle}>
      {showImg && (
        <img src={imgSrc}
          onError={() => setImgFailed(true)}
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
      )}
      {imgFailed && (
        <div style={{
          width: '100%', height: '100%',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: theme.font.display,
          fontSize: px * 0.45,
          color: tColor,
          textShadow: `0 0 12px ${tColor}80`,
          letterSpacing: 0,
        }}>
          {model.surname.slice(0, 1).toUpperCase()}
        </div>
      )}
      {!bare && (
        <>
          <span style={{ ...cornerStyle(tColor), top: -1, left: -1, borderTop: `2px solid ${tColor}`, borderLeft: `2px solid ${tColor}` }} />
          <span style={{ ...cornerStyle(tColor), top: -1, right: -1, borderTop: `2px solid ${tColor}`, borderRight: `2px solid ${tColor}` }} />
          <span style={{ ...cornerStyle(tColor), bottom: -1, left: -1, borderBottom: `2px solid ${tColor}`, borderLeft: `2px solid ${tColor}` }} />
          <span style={{ ...cornerStyle(tColor), bottom: -1, right: -1, borderBottom: `2px solid ${tColor}`, borderRight: `2px solid ${tColor}` }} />
          {/* Rarity dot top-right */}
          <span style={{ ...rarityDotStyle, background: rColor, boxShadow: `0 0 6px ${rColor}` }} />
        </>
      )}
    </div>
  );
}

function cornerStyle(_color: string): CSSProperties {
  return {
    position: 'absolute',
    width: 6, height: 6,
    pointerEvents: 'none',
  };
}

const rarityDotStyle: CSSProperties = {
  position: 'absolute',
  top: 4, right: 4,
  width: 4, height: 4,
  borderRadius: 2,
  pointerEvents: 'none',
};
