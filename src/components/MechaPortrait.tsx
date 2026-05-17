/**
 * MechaPortrait — visual portrait for a mecha model.
 *
 * Two asset modes:
 *   - 'mini' : round portrait (combat HUD, roster lists, captures). Sources
 *              from /assets/mechas/<modelId>_mini.jpeg (or .png as fallback).
 *   - 'full' : rectangular "trading card" art (profile detail, capture screen).
 *              Sources from /assets/mechas/<modelId>_full.jpeg (or .png).
 *
 * If the image file isn't present, falls back to a styled placeholder:
 *   - mini → round disc with the first letter of the model surname
 *   - full → rectangular panel with mecha name + type + rarity layout
 *
 * To add real art later, just drop image files into /public/assets/mechas/
 * using the naming convention. No code changes required.
 *
 * Sizes (all in px):
 *   mini: xs=24, sm=36, md=56, lg=84
 *   full: sm=120, md=180, lg=240 (height; width is auto via aspect ratio)
 */

import { CSSProperties, useState } from 'react';
import { MODELS, RARITY_INFO } from '../data/models';
import { TYPE_INFO } from '../data/types';
import { theme } from '../styles/theme';

type MiniSize = 'xs' | 'sm' | 'md' | 'lg';
type FullSize = 'sm' | 'md' | 'lg';

const MINI_PX: Record<MiniSize, number> = { xs: 24, sm: 36, md: 56, lg: 84 };
const FULL_HEIGHT: Record<FullSize, number> = { sm: 120, md: 180, lg: 240 };

interface MiniProps {
  modelId: string;
  size?: MiniSize;
  /** Removes the rarity dot and corner brackets. Used in dense lists. */
  bare?: boolean;
  /** Optional outline color override (default = type color). */
  outline?: string;
}

/**
 * Round mini portrait. Used in:
 *   - Combat HUD (party tiles)
 *   - Roster card heads
 *   - Dex collection rows
 *   - Capture KEEP/SALVAGE preview
 */
export function MechaMini({ modelId, size = 'sm', bare = false, outline }: MiniProps) {
  const [imgFailed, setImgFailed] = useState(false);
  const model = MODELS[modelId];
  if (!model) return null;

  const px = MINI_PX[size];
  const tColor = outline ?? theme.typeColor[model.type] ?? theme.color.textMuted;
  const rColor = RARITY_INFO[model.rarity]?.color ?? theme.color.textMuted;

  const wrapStyle: CSSProperties = {
    width: px,
    height: px,
    position: 'relative',
    borderRadius: '50%',
    background: `radial-gradient(circle at 35% 24%, ${tColor}44 0%, ${theme.color.bgSunken} 72%), linear-gradient(135deg, ${theme.color.grime}, ${theme.color.bgSunken})`,
    border: bare ? `1px solid ${tColor}90` : `2px solid ${theme.color.ink}`,
    outline: bare ? undefined : `1px solid ${tColor}`,
    boxShadow: bare ? 'none' : `0 0 10px ${tColor}36, inset 0 0 0 2px rgba(255,255,255,0.05), inset 0 -10px 18px rgba(0,0,0,0.55)`,
    flexShrink: 0,
    overflow: 'hidden',
  };

  const imgSrc = `${import.meta.env.BASE_URL}assets/mechas/${modelId}_mini.jpeg`;
  const showImg = !imgFailed;

  return (
    <div className="ic-worn-surface" style={wrapStyle} title={model.surname}>
      {showImg && (
        <img src={imgSrc}
          onError={() => setImgFailed(true)}
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', borderRadius: '50%', filter: 'contrast(1.08) saturate(1.12)' }}
          alt={model.surname} />
      )}
      {imgFailed && (
        <div style={{
          width: '100%', height: '100%',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: theme.font.display,
          fontSize: px * 0.45,
          color: tColor,
          textShadow: `0 0 10px ${tColor}80`,
          letterSpacing: 0,
        }}>
          {model.surname.slice(0, 1).toUpperCase()}
        </div>
      )}
      {!bare && (
        <span style={{
          position: 'absolute',
          top: 2, right: 2,
          width: 6, height: 6,
          borderRadius: 3,
          background: rColor,
          boxShadow: `0 0 4px ${rColor}`,
          pointerEvents: 'none',
        }} />
      )}
    </div>
  );
}

interface FullProps {
  modelId: string;
  size?: FullSize;
}

/**
 * Full trading-card portrait. Used in:
 *   - Capture choice screen (the "you defeated a wild" panel)
 *   - Mecha profile detail view
 *   - Dex detail (when implemented)
 *
 * Loads /assets/mechas/<modelId>_full.jpeg. Falls back to a styled card
 * with name/type/rarity readout.
 */
export function MechaFull({ modelId, size = 'md' }: FullProps) {
  const [imgFailed, setImgFailed] = useState(false);
  const model = MODELS[modelId];
  if (!model) return null;

  const h = FULL_HEIGHT[size];
  const w = Math.round(h * 0.75);   // 3:4 portrait aspect for trading-card vibe
  const tColor = theme.typeColor[model.type] ?? theme.color.textMuted;
  const rColor = RARITY_INFO[model.rarity]?.color ?? theme.color.textMuted;

  const wrapStyle: CSSProperties = {
    width: w,
    height: h,
    position: 'relative',
    background: `linear-gradient(160deg, rgba(255,255,255,0.08) 0%, transparent 18%), radial-gradient(circle at 50% 18%, ${tColor}38 0%, transparent 45%), linear-gradient(180deg, ${theme.color.bgRaised} 0%, ${theme.color.bgSunken} 100%)`,
    border: `2px solid ${theme.color.ink}`,
    outline: `1px solid ${tColor}`,
    boxShadow: `0 0 18px ${tColor}34, inset 0 0 0 1px rgba(255,255,255,0.045), inset 0 -18px 38px rgba(0,0,0,0.48)`,
    overflow: 'hidden',
    flexShrink: 0,
  };

  const imgSrc = `${import.meta.env.BASE_URL}assets/mechas/${modelId}_full.jpeg`;
  const showImg = !imgFailed;

  return (
    <div className="ic-worn-surface" style={wrapStyle}>
      {showImg && (
        <img src={imgSrc}
          onError={() => setImgFailed(true)}
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', filter: 'contrast(1.08) saturate(1.15)' }}
          alt={model.surname} />
      )}
      {imgFailed && (
        <div style={{
          width: '100%', height: '100%',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          padding: 8,
          gap: 4,
        }}>
          <div style={{
            fontFamily: theme.font.display,
            fontSize: Math.round(h * 0.32),
            color: tColor,
            textShadow: `0 0 14px ${tColor}80, 0 0 30px ${tColor}40`,
            letterSpacing: 2,
            lineHeight: 1,
          }}>
            {model.surname.slice(0, 1).toUpperCase()}
          </div>
          <div style={{
            fontFamily: theme.font.display,
            fontSize: Math.round(h * 0.07),
            color: '#fff',
            letterSpacing: 1,
            textTransform: 'uppercase',
            textAlign: 'center',
          }}>
            {model.surname}
          </div>
          <div style={{
            fontFamily: theme.font.mono,
            fontSize: Math.round(h * 0.05),
            color: tColor,
            letterSpacing: 1,
            textAlign: 'center',
          }}>
            {TYPE_INFO[model.type].name} · {RARITY_INFO[model.rarity].name}
          </div>
        </div>
      )}

      <span style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: 46,
        height: 7,
        color: tColor,
        opacity: 0.75,
        background: 'repeating-linear-gradient(135deg, currentColor 0 7px, transparent 7px 12px)',
        pointerEvents: 'none',
        zIndex: 3,
      }} />

      {/* Corner brackets */}
      <span style={cornerStyle({ top: true, left: true, color: tColor })} />
      <span style={cornerStyle({ top: true, right: true, color: tColor })} />
      <span style={cornerStyle({ bottom: true, left: true, color: tColor })} />
      <span style={cornerStyle({ bottom: true, right: true, color: tColor })} />

      {/* Rarity dot */}
      <span style={{
        position: 'absolute',
        top: 6, right: 6,
        width: 8, height: 8,
        borderRadius: 4,
        background: rColor,
        boxShadow: `0 0 8px ${rColor}`,
      }} />

      {/* Dex number bottom-left */}
      <span style={{
        position: 'absolute',
        bottom: 6, left: 8,
        fontFamily: theme.font.mono,
        fontSize: 9,
        color: tColor,
        letterSpacing: 1,
      }}>
        #{String(model.dexNo).padStart(3, '0')}
      </span>
    </div>
  );
}

// ============================================================
// BACK-COMPAT: keep `MechaPortrait` export for existing call sites
// ============================================================

interface PortraitProps {
  modelId: string;
  size?: 'sm' | 'md' | 'lg';
  bare?: boolean;
}

/** @deprecated Use `MechaMini` or `MechaFull` directly. */
export function MechaPortrait({ modelId, size = 'md', bare = false }: PortraitProps) {
  return <MechaMini modelId={modelId} size={size} bare={bare} />;
}

// ============================================================
// Helpers
// ============================================================

function cornerStyle({ top, bottom, left, right, color, size = 8 }: {
  top?: boolean; bottom?: boolean; left?: boolean; right?: boolean;
  color: string; size?: number;
}): CSSProperties {
  return {
    position: 'absolute',
    width: size, height: size,
    pointerEvents: 'none',
    top: top ? -1 : undefined,
    bottom: bottom ? -1 : undefined,
    left: left ? -1 : undefined,
    right: right ? -1 : undefined,
    borderTop: top ? `2px solid ${color}` : undefined,
    borderBottom: bottom ? `2px solid ${color}` : undefined,
    borderLeft: left ? `2px solid ${color}` : undefined,
    borderRight: right ? `2px solid ${color}` : undefined,
  };
}
