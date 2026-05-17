/**
 * MechaCard — fullscreen "trading card" view for a mecha.
 *
 * Three modes via the `mode` prop:
 *   - 'roster' : viewing one of the player's bots — shows level, HP/BAT, equipment,
 *                moves, plus action buttons (Assign Items, Promote to Crew)
 *   - 'dex'    : viewing a dex entry (model only) — no player-bot fields
 *   - 'capture': just-defeated wild — shows KEEP / SALVAGE buttons instead
 *
 * Layout:
 *   The full image fills the entire card as a background. Stats, name,
 *   rarity, and quote are overlaid on top. Below the card, moves and
 *   action buttons render in normal scrollable flow.
 *
 * Renders as a fullscreen modal — tap the X (top-right) or backdrop to close.
 */

import { CSSProperties, ReactNode } from 'react';
import { MODELS, RARITY_INFO } from '../data/models';
import { TYPE_INFO } from '../data/types';
import { theme } from '../styles/theme';
import { ATTACKS } from '../data/attacks';
import { WEAPONS } from '../data/weapons';
import { ARMORS } from '../data/armors';
import { getBattery } from '../data/batteries';
import { getBotStats, getBotPower, calcMentorBonuses, maxBatteryOf } from '../game/stats';
import { getActiveAttacks, getSignatureAttack } from '../game/combat';
import type { Bot, CrewMember } from '../game/types';

interface CommonProps {
  modelId: string;
  onClose: () => void;
}

interface RosterProps extends CommonProps {
  mode: 'roster';
  bot: Bot;
  crew: CrewMember[];
  actions?: ReactNode;
}

interface DexProps extends CommonProps {
  mode: 'dex';
  owned: boolean;
}

interface CaptureProps extends CommonProps {
  mode: 'capture';
  wildLevel: number;
  alreadyOwn: boolean;
  actions?: ReactNode;
}

type Props = RosterProps | DexProps | CaptureProps;

export function MechaCard(props: Props) {
  const model = MODELS[props.modelId];
  if (!model) return null;

  const tColor = theme.typeColor[model.type];
  const rInfo = RARITY_INFO[model.rarity];
  const imgUrl = `${import.meta.env.BASE_URL}assets/mechas/${model.id}_full.jpeg`;

  // Derive displayed values per mode
  let displayLevel: number | null = null;
  let curHp: number | null = null;
  let maxHp: number = model.maxHp;
  let curBat: number | null = null;
  let maxBat: number | null = null;
  let attack = model.baseStats.attack;
  let defense = model.baseStats.defense;
  let speed = model.baseStats.speed;
  let intelligence = model.baseStats.intelligence;
  let moves: typeof ATTACKS[string][] = [];
  let weapon: string | null = null;
  let armor: string | null = null;
  let signatureAttack: typeof ATTACKS[string] | null = null;
  let nameLine = model.surname;
  let curXp: number | null = null;
  let xpToNext: number | null = null;

  if (props.mode === 'roster') {
    const bot = props.bot;
    nameLine = `${bot.firstName} ${model.surname}`;
    displayLevel = bot.level;
    maxHp = bot.maxHp;
    curHp = bot.maxHp; // persistent bot doesn't track current HP outside combat
    maxBat = maxBatteryOf(bot);
    curBat = maxBat;
    curXp = bot.xp;
    xpToNext = bot.level >= 30 ? 0 : bot.xpToNext;
    const f = getBotStats(bot, calcMentorBonuses(props.crew));
    attack = f.attack;
    defense = f.defense;
    speed = f.speed;
    intelligence = f.intelligence;
    moves = getActiveAttacks(bot);
    signatureAttack = getSignatureAttack(bot);
    weapon = bot.weapon;
    armor = bot.armor;
  } else if (props.mode === 'capture') {
    displayLevel = props.wildLevel;
    moves = getActiveAttacks({ modelId: model.id, learnedAttacks: [] });
  } else {
    // dex
    moves = getActiveAttacks({ modelId: model.id, learnedAttacks: [] });
  }

  return (
    <div style={overlayStyle} onClick={props.mode === 'capture' ? undefined : props.onClose}>
      <div style={modalWrapStyle} onClick={e => e.stopPropagation()}>
        {/* ============ THE CARD ============ */}
        <div style={cardStyle(tColor, rInfo.color)}>
          {/* corner brackets */}
          <span style={cornerStyle(tColor, 'top', 'left')} />
          <span style={cornerStyle(tColor, 'top', 'right')} />
          <span style={cornerStyle(tColor, 'bottom', 'left')} />
          <span style={cornerStyle(tColor, 'bottom', 'right')} />

          {/* close X — hidden in capture mode (player must choose KEEP or SALVAGE) */}
          {props.mode !== 'capture' && (
            <button style={closeXStyle(tColor)} onClick={props.onClose} aria-label="Close">×</button>
          )}

          {/* IMAGE: fills the entire card */}
          <div style={imgBgStyle(imgUrl, tColor)} />

          {/* gradient overlay for legibility (darker top + bottom) */}
          <div style={gradientStyle} />

          {/* === TOP: name + type + rarity + level/HP/BAT === */}
          <div style={topStripStyle}>
            <div style={topLeftStyle}>
              <div style={nameStyle(tColor)}>{nameLine}</div>
              <div style={typeRowStyle}>
                <span style={{ ...typeChipStyle, color: tColor, borderColor: tColor }}>
                  {TYPE_INFO[model.type].name.toUpperCase()}-TYPE
                </span>
                <span style={{ ...roleChipStyle, color: theme.color.textMuted }}>
                  {model.role.toUpperCase()}
                </span>
              </div>
            </div>
            <div style={topRightStyle}>
              <div style={{ ...rarityBadgeStyle, color: rInfo.color, borderColor: rInfo.color }}>
                {rInfo.name.toUpperCase()}
              </div>
              {displayLevel !== null && (
                <div style={levelBoxStyle(tColor)}>
                  <span style={levelLabelStyle}>LV</span>
                  <span style={levelValStyle}>{displayLevel}</span>
                </div>
              )}
              {curXp !== null && xpToNext !== null && xpToNext > 0 && (
                <div style={xpWrapStyle}>
                  <div style={xpBarStyle}>
                    <div style={{ ...xpFillStyle, width: `${Math.min(100, (curXp / xpToNext) * 100)}%`, background: tColor }} />
                  </div>
                  <div style={xpTextStyle}>XP {curXp}/{xpToNext}</div>
                </div>
              )}
              {curXp !== null && xpToNext === 0 && (
                <div style={xpWrapStyle}>
                  <div style={xpTextStyle}>LV MAX</div>
                </div>
              )}
              {curHp !== null && (
                <div style={hpRowStyle}>
                  <span style={hpLabelStyle}>HP</span>
                  <span style={hpValStyle}>{curHp}/{maxHp}</span>
                </div>
              )}
              {curBat !== null && (
                <div style={batRowStyle}>
                  <span style={batLabelStyle}>BAT</span>
                  <span style={batValStyle}>{curBat}/{maxBat}</span>
                </div>
              )}
            </div>
          </div>

          {/* === BOTTOM-LEFT: stat box + quote === */}
          <div style={statsBoxStyle(tColor)}>
            <div style={statRowStyle}>
              <span style={statKeyStyle}>ATK</span><span style={statValStyle(tColor)}>{attack}</span>
            </div>
            <div style={statRowStyle}>
              <span style={statKeyStyle}>DEF</span><span style={statValStyle(tColor)}>{defense}</span>
            </div>
            <div style={statRowStyle}>
              <span style={statKeyStyle}>SPD</span><span style={statValStyle(tColor)}>{speed}</span>
            </div>
            <div style={statRowStyle}>
              <span style={statKeyStyle}>INT</span><span style={statValStyle(tColor)}>{intelligence}</span>
            </div>
            {model.quote && (
              <div style={quoteStyle}>"{model.quote}"</div>
            )}
          </div>

          {/* === BOTTOM-RIGHT: dex number === */}
          <div style={dexNoStyle(tColor)}>
            <div style={dexNoLabelStyle}>DEX</div>
            <div style={dexNoValStyle}>{String(model.dexNo).padStart(3, '0')}</div>
          </div>
        </div>

        {/* ============ BELOW THE CARD: moves + equipment + actions ============ */}
        <div style={belowCardStyle}>
          {/* MOVES */}
          <div style={sectionHeadStyle(tColor)}>MOVES</div>
          {moves.map(m => (
            <div key={m.id} style={moveRowStyle}>
              <div style={moveNameStyle}>{m.name}</div>
              <div style={moveStatsStyle}>
                <span style={{ color: m.type === 'physical' ? theme.color.textMuted : theme.typeColor[m.type] }}>{m.type.toUpperCase()}</span>
                {' · '}PWR {m.power} · ACC {m.accuracy}% · <span style={{ color: theme.color.info }}>{m.batteryCost} BAT</span>
              </div>
              {m.desc && <div style={moveDescStyle}>{m.desc}</div>}
            </div>
          ))}
          {signatureAttack && (
            <div style={{ ...moveRowStyle, borderColor: theme.color.gold }}>
              <div style={moveNameStyle}>★ {signatureAttack.name} <span style={{ color: theme.color.gold, fontSize: 9 }}>SIGNATURE</span></div>
              <div style={moveStatsStyle}>
                <span style={{ color: theme.typeColor[signatureAttack.type] ?? theme.color.text }}>{signatureAttack.type.toUpperCase()}</span>
                {' · '}PWR {signatureAttack.power} · ACC {signatureAttack.accuracy}% · <span style={{ color: theme.color.info }}>{signatureAttack.batteryCost} BAT</span>
              </div>
              {signatureAttack.desc && <div style={moveDescStyle}>{signatureAttack.desc}</div>}
            </div>
          )}

          {/* EQUIPMENT — roster only */}
          {props.mode === 'roster' && (
            <>
              <div style={sectionHeadStyle(tColor)}>EQUIPMENT</div>
              <div style={equipRowStyle}>
                <span style={equipLblStyle}>WEAPON</span>
                <span style={equipValStyle}>{weapon ? WEAPONS[weapon]?.name : '—'}</span>
              </div>
              <div style={equipRowStyle}>
                <span style={equipLblStyle}>ARMOR</span>
                <span style={equipValStyle}>{armor ? ARMORS[armor]?.name : '—'}</span>
              </div>
              <div style={equipRowStyle}>
                <span style={equipLblStyle}>BATTERY</span>
                <span style={equipValStyle}>{getBattery(props.bot.battery).name} <span style={{ color: theme.color.info, fontSize: 10 }}>({maxBat} cap)</span></span>
              </div>
            </>
          )}

          {/* FLAVOR + ACQUISITION (dex/capture mode only — roster usually knows already) */}
          {props.mode !== 'roster' && (
            <>
              <div style={sectionHeadStyle(tColor)}>NOTES</div>
              <div style={flavorStyle}>{model.flavor}</div>
              <div style={equipRowStyle}>
                <span style={equipLblStyle}>ACQUIRE</span>
                <span style={equipValStyle}>{model.acquisition}</span>
              </div>
              {props.mode === 'capture' && props.alreadyOwn && (
                <div style={warningStyle}>
                  ⚠ You already own a {model.surname}. Only one per model — must salvage.
                </div>
              )}
            </>
          )}

          {/* CUSTOM ACTIONS */}
          {(props.mode === 'roster' || props.mode === 'capture') && props.actions && (
            <div style={actionsStyle}>{props.actions}</div>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================================
// Styles
// ============================================================

const overlayStyle: CSSProperties = {
  position: 'fixed',
  inset: 0,
  background: 'rgba(0, 0, 0, 0.92)',
  zIndex: 1000,
  overflowY: 'auto',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  padding: '20px 16px',
};

const modalWrapStyle: CSSProperties = {
  width: '100%',
  maxWidth: 440,
  display: 'flex',
  flexDirection: 'column',
};

const cardStyle = (tColor: string, rColor: string): CSSProperties => ({
  width: '100%',
  aspectRatio: '3 / 4',
  position: 'relative',
  background: theme.color.bgSunken,
  border: `2px solid ${tColor}`,
  boxShadow: `0 0 32px ${tColor}50, 0 0 0 1px ${rColor}40 inset`,
  overflow: 'hidden',
});

const cornerStyle = (color: string, v: 'top' | 'bottom', h: 'left' | 'right', size = 14): CSSProperties => ({
  position: 'absolute',
  width: size, height: size,
  [v]: -1,
  [h]: -1,
  [v === 'top' ? 'borderTop' : 'borderBottom']: `2px solid ${color}`,
  [h === 'left' ? 'borderLeft' : 'borderRight']: `2px solid ${color}`,
  pointerEvents: 'none',
  zIndex: 3,
}) as CSSProperties;

const closeXStyle = (tColor: string): CSSProperties => ({
  position: 'absolute',
  top: 8,
  right: 8,
  width: 28,
  height: 28,
  background: 'rgba(0,0,0,0.7)',
  border: `1px solid ${tColor}`,
  color: '#fff',
  fontFamily: theme.font.display,
  fontSize: 22,
  lineHeight: '22px',
  cursor: 'pointer',
  zIndex: 10,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
});

const imgBgStyle = (url: string, tColor: string): CSSProperties => ({
  position: 'absolute',
  inset: 0,
  background: `url(${url}) center/cover no-repeat, linear-gradient(135deg, ${tColor}30 0%, ${theme.color.bgSunken} 100%)`,
});

const gradientStyle: CSSProperties = {
  position: 'absolute',
  inset: 0,
  background: `
    linear-gradient(180deg,
      rgba(0,0,0,0.7) 0%,
      rgba(0,0,0,0.1) 22%,
      rgba(0,0,0,0.0) 50%,
      rgba(0,0,0,0.5) 80%,
      rgba(0,0,0,0.85) 100%
    )
  `,
  pointerEvents: 'none',
};

const topStripStyle: CSSProperties = {
  position: 'absolute',
  top: 12,
  left: 12,
  right: 12,
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
  gap: 12,
  zIndex: 2,
};

const topLeftStyle: CSSProperties = {
  flex: 1,
  minWidth: 0,
};

const topRightStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-end',
  gap: 4,
  flexShrink: 0,
  paddingRight: 32, // leave room for close X
};

const nameStyle = (tColor: string): CSSProperties => ({
  fontFamily: theme.font.display,
  fontSize: 24,
  letterSpacing: 1,
  color: '#fff',
  textShadow: `0 0 12px ${tColor}80, 0 0 4px #000`,
  marginBottom: 4,
  lineHeight: 1.1,
});

const typeRowStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 6,
  flexWrap: 'wrap',
};

const typeChipStyle: CSSProperties = {
  fontFamily: theme.font.mono,
  fontSize: 10,
  letterSpacing: 1.5,
  padding: '2px 6px',
  border: '1px solid',
  background: 'rgba(0,0,0,0.6)',
};

const roleChipStyle: CSSProperties = {
  fontFamily: theme.font.mono,
  fontSize: 9,
  letterSpacing: 1.5,
};

const rarityBadgeStyle: CSSProperties = {
  fontFamily: theme.font.display,
  fontSize: 11,
  letterSpacing: 2,
  padding: '4px 8px',
  border: '1px solid',
  background: 'rgba(0,0,0,0.7)',
};

const levelBoxStyle = (tColor: string): CSSProperties => ({
  display: 'flex',
  alignItems: 'baseline',
  gap: 4,
  padding: '2px 8px',
  background: 'rgba(0,0,0,0.7)',
  border: `1px solid ${tColor}80`,
});

const levelLabelStyle: CSSProperties = {
  fontFamily: theme.font.mono,
  fontSize: 9,
  color: theme.color.textMuted,
  letterSpacing: 1,
};

const levelValStyle: CSSProperties = {
  fontFamily: theme.font.display,
  fontSize: 18,
  color: '#fff',
};

const hpRowStyle: CSSProperties = {
  display: 'flex',
  gap: 4,
  alignItems: 'baseline',
  padding: '1px 6px',
  background: 'rgba(0,0,0,0.7)',
};

const hpLabelStyle: CSSProperties = {
  fontFamily: theme.font.mono,
  fontSize: 9,
  color: theme.color.success,
  letterSpacing: 1,
};

const hpValStyle: CSSProperties = {
  fontFamily: theme.font.mono,
  fontSize: 11,
  color: '#fff',
};

const batRowStyle: CSSProperties = {
  display: 'flex',
  gap: 4,
  alignItems: 'baseline',
  padding: '1px 6px',
  background: 'rgba(0,0,0,0.7)',
};

const batLabelStyle: CSSProperties = {
  fontFamily: theme.font.mono,
  fontSize: 9,
  color: theme.color.info,
  letterSpacing: 1,
};

const batValStyle: CSSProperties = {
  fontFamily: theme.font.mono,
  fontSize: 11,
  color: '#fff',
};

const xpWrapStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-end',
  gap: 2,
  padding: '3px 6px',
  background: 'rgba(0,0,0,0.7)',
  minWidth: 100,
};

const xpBarStyle: CSSProperties = {
  width: 90,
  height: 4,
  background: 'rgba(255,255,255,0.12)',
  overflow: 'hidden',
};

const xpFillStyle: CSSProperties = {
  height: '100%',
  transition: 'width 0.4s',
};

const xpTextStyle: CSSProperties = {
  fontFamily: theme.font.mono,
  fontSize: 8,
  color: theme.color.textMuted,
  letterSpacing: 1,
  lineHeight: 1,
};

const statsBoxStyle = (tColor: string): CSSProperties => ({
  position: 'absolute',
  bottom: 12,
  left: 12,
  background: 'rgba(0,0,0,0.78)',
  border: `1px solid ${tColor}80`,
  padding: '8px 10px',
  minWidth: 140,
  zIndex: 2,
  display: 'flex',
  flexDirection: 'column',
  gap: 2,
});

const statRowStyle: CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  gap: 12,
  alignItems: 'baseline',
};

const statKeyStyle: CSSProperties = {
  fontFamily: theme.font.mono,
  fontSize: 10,
  color: theme.color.textMuted,
  letterSpacing: 1.2,
};

const statValStyle = (tColor: string): CSSProperties => ({
  fontFamily: theme.font.display,
  fontSize: 14,
  color: tColor,
  textShadow: `0 0 6px ${tColor}80`,
});

const quoteStyle: CSSProperties = {
  marginTop: 6,
  paddingTop: 6,
  borderTop: `1px solid ${theme.color.border}`,
  fontFamily: theme.font.body,
  fontSize: 9,
  color: '#fff',
  fontStyle: 'italic',
  letterSpacing: 0.5,
  lineHeight: 1.3,
  maxWidth: 150,
};

const dexNoStyle = (tColor: string): CSSProperties => ({
  position: 'absolute',
  bottom: 12,
  right: 12,
  background: 'rgba(0,0,0,0.78)',
  border: `1px solid ${tColor}80`,
  padding: '4px 10px',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  zIndex: 2,
});

const dexNoLabelStyle: CSSProperties = {
  fontFamily: theme.font.mono,
  fontSize: 8,
  color: theme.color.textMuted,
  letterSpacing: 1.5,
};

const dexNoValStyle: CSSProperties = {
  fontFamily: theme.font.display,
  fontSize: 18,
  color: '#fff',
  lineHeight: 1,
};

// ----- below-card section -----

const belowCardStyle: CSSProperties = {
  marginTop: 12,
  background: theme.color.bgRaised,
  padding: 14,
  border: `1px solid ${theme.color.border}`,
};

const sectionHeadStyle = (tColor: string): CSSProperties => ({
  fontFamily: theme.font.mono,
  fontSize: 10,
  letterSpacing: 2,
  color: tColor,
  marginTop: 8,
  marginBottom: 6,
  paddingBottom: 4,
  borderBottom: `1px solid ${tColor}40`,
});

const moveRowStyle: CSSProperties = {
  padding: '6px 10px',
  background: theme.color.bgSunken,
  border: `1px solid ${theme.color.border}`,
  marginBottom: 4,
};

const moveNameStyle: CSSProperties = {
  fontFamily: theme.font.display,
  fontSize: 13,
  color: '#fff',
  letterSpacing: 0.5,
};

const moveStatsStyle: CSSProperties = {
  fontFamily: theme.font.mono,
  fontSize: 9,
  color: theme.color.textMuted,
  letterSpacing: 0.5,
  marginTop: 2,
};

const moveDescStyle: CSSProperties = {
  fontFamily: theme.font.body,
  fontSize: 10,
  color: theme.color.textDim,
  fontStyle: 'italic',
  marginTop: 2,
};

const equipRowStyle: CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  padding: '4px 8px',
  background: theme.color.bgSunken,
  marginBottom: 3,
  border: `1px solid ${theme.color.border}`,
};

const equipLblStyle: CSSProperties = {
  fontFamily: theme.font.mono,
  fontSize: 10,
  color: theme.color.textMuted,
  letterSpacing: 1,
};

const equipValStyle: CSSProperties = {
  fontFamily: theme.font.body,
  fontSize: 12,
  color: '#fff',
};

const flavorStyle: CSSProperties = {
  fontFamily: theme.font.body,
  fontSize: 12,
  color: theme.color.text,
  fontStyle: 'italic',
  lineHeight: 1.5,
  padding: 8,
  background: theme.color.bgSunken,
  marginBottom: 6,
};

const warningStyle: CSSProperties = {
  marginTop: 8,
  padding: 8,
  border: `1px solid ${theme.color.danger}`,
  background: 'rgba(255, 0, 0, 0.1)',
  color: theme.color.danger,
  fontSize: 11,
  fontFamily: theme.font.mono,
  letterSpacing: 0.5,
};

const actionsStyle: CSSProperties = {
  marginTop: 14,
  display: 'flex',
  flexDirection: 'column',
  gap: 6,
};
