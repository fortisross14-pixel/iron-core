import { CSSProperties, useState } from 'react';
import { useGame } from '../state/GameStore';
import { Shell } from '../components/Shell';
import { Button } from '../components/Button';
import { theme } from '../styles/theme';
import { useCityPalette } from '../styles/cityPalette';
import { BracketLabel, EdgeBand } from '../components/Frame';
import { MechaMini } from '../components/MechaPortrait';
import { MechaCard } from '../components/MechaCard';
import { MODELS, MODEL_LIST, TOTAL_DEX, RARITY_INFO } from '../data/models';
import { WEAPONS } from '../data/weapons';
import { ARMORS } from '../data/armors';
import { ATTACKS } from '../data/attacks';
import { TYPE_INFO } from '../data/types';
import { getBotStats, getBotPower, calcMentorBonuses, getDiskCapacity } from '../game/stats';
import { getActiveAttacks, getSignatureAttack } from '../game/combat';
import { getBotFullName } from '../game/display';
import type { Bot } from '../game/types';

type Tab = 'roster' | 'collection' | 'crew';

export function StableScreen() {
  const { state } = useGame();
  const palette = useCityPalette();
  const [tab, setTab] = useState<Tab>('roster');

  const subTabStyle = (active: boolean): CSSProperties => ({
    flex: 1,
    background: active ? `${palette.c5}c0` : 'transparent',
    color: active ? palette.c1 : palette.c4,
    border: `1px solid ${active ? palette.c1 : palette.c4 + '60'}`,
    padding: '8px 4px',
    fontFamily: theme.font.mono,
    fontSize: theme.size.tiny,
    letterSpacing: theme.letter.wide,
    cursor: 'pointer',
    textShadow: active ? `0 0 8px ${palette.c1}80` : 'none',
  });

  return (
    <Shell pageLabel="STABLE">
      <div style={{ marginBottom: theme.space.xs }}>
        <BracketLabel>STABLE · {tab.toUpperCase()}</BracketLabel>
      </div>
      <div style={titleStyle(palette)}>YOUR STABLE</div>
      <EdgeBand color={palette.c1} />

      <div style={{ ...subTabsStyle, marginTop: theme.space.md }}>
        <button onClick={() => setTab('roster')} style={subTabStyle(tab === 'roster')}>
          ROSTER · {state.bots.length}/5
        </button>
        <button onClick={() => setTab('crew')} style={subTabStyle(tab === 'crew')}>
          CREW · {state.crew.length}
        </button>
        <button onClick={() => setTab('collection')} style={subTabStyle(tab === 'collection')}>
          DEX · {state.discovered.size}/{TOTAL_DEX}
        </button>
      </div>

      {tab === 'roster' && <RosterTab />}
      {tab === 'crew' && <CrewTab />}
      {tab === 'collection' && <CollectionTab />}
    </Shell>
  );
}

const titleStyle = (p: { c1: string }): CSSProperties => ({
  fontFamily: theme.font.display,
  fontSize: theme.size.h1,
  letterSpacing: theme.letter.wider,
  color: '#fff',
  marginBottom: theme.space.xs,
  textShadow: `0 0 14px ${p.c1}60`,
});

function RosterTab() {
  const { state, dispatch } = useGame();
  const [cardBotId, setCardBotId] = useState<string | null>(null);
  const mentorBonuses = calcMentorBonuses(state.crew);

  if (state.bots.length === 0) {
    return <div style={emptyStyle}>No bots yet. Visit the workshop or the Voltspire market.</div>;
  }

  const cardBot = cardBotId ? state.bots.find(b => b.id === cardBotId) ?? null : null;

  return (
    <>
      {state.bots.map(bot => {
        const m = MODELS[bot.modelId];
        const t = TYPE_INFO[m.type];
        const power = getBotPower(bot, mentorBonuses);
        const tColor = theme.typeColor[m.type];

        return (
          <button key={bot.id} style={{
            ...cardStyle,
            position: 'relative',
            background: theme.color.bgRaised,
            borderColor: theme.color.border,
            width: '100%',
            textAlign: 'left',
            cursor: 'pointer',
            display: 'grid',
            gridTemplateColumns: '48px 1fr auto',
            gap: 10,
            alignItems: 'center',
            padding: theme.space.md,
          }}
            onClick={() => setCardBotId(bot.id)}>
            <MechaMini modelId={bot.modelId} size="sm" />
            <div style={{ minWidth: 0 }}>
              <div style={nameStyle}>
                {getBotFullName(bot)}
                <span style={{ ...chipStyle, color: tColor, borderColor: tColor }}>{t.name}</span>
              </div>
              <div style={subStyle}>LV {bot.level} · PWR {power}</div>
            </div>
            <div style={{ ...chevronStyle, color: tColor }}>→</div>
          </button>
        );
      })}
      {cardBot && (
        <MechaCard
          mode="roster"
          modelId={cardBot.modelId}
          bot={cardBot}
          crew={state.crew}
          onClose={() => setCardBotId(null)}
          actions={
            <>
              <Button full onClick={() => {
                setCardBotId(null);
                dispatch({ type: 'OPEN_ASSIGN', botId: cardBot.id });
              }}>
                ASSIGN ITEMS →
              </Button>
              <PromoteToCrewButton botId={cardBot.id} botName={cardBot.firstName} />
            </>
          }
        />
      )}
    </>
  );
}

function PromoteToCrewButton({ botId, botName }: { botId: string; botName: string }) {
  const { dispatch } = useGame();
  const [confirming, setConfirming] = useState(false);

  if (!confirming) {
    return (
      <Button full variant="ghost" small
        onClick={() => setConfirming(true)}
        style={{ marginTop: 6 }}>
        ↑ PROMOTE TO CREW
      </Button>
    );
  }

  return (
    <div style={confirmBoxStyle}>
      <div style={confirmTextStyle}>
        Promote <strong>{botName}</strong> to crew? This is permanent.
        Weapons and armor return to your inventory.
      </div>
      <div style={confirmButtonsStyle}>
        <Button small variant="secondary" full onClick={() => setConfirming(false)}>CANCEL</Button>
        <Button small full onClick={() => {
          dispatch({ type: 'PROMOTE_TO_CREW', botId });
          setConfirming(false);
        }}>CONFIRM →</Button>
      </div>
    </div>
  );
}

function CrewTab() {
  const { state } = useGame();
  const totalBonus = calcMentorBonuses(state.crew);

  if (state.crew.length === 0) {
    return (
      <div style={emptyStyle}>
        No crew yet. Promote a roster bot to retire it — its strongest stat will permanently buff all your active bots.
      </div>
    );
  }

  return (
    <>
      <div style={crewSummaryStyle}>
        <div style={crewSummaryHeadStyle}>CREW BONUSES TO ALL ROSTER</div>
        <div style={crewBonusRowStyle}>
          <span>+{totalBonus.attack.toFixed(1)}% ATK</span>
          <span>+{totalBonus.defense.toFixed(1)}% DEF</span>
          <span>+{totalBonus.speed.toFixed(1)}% SPD</span>
        </div>
      </div>
      {state.crew.map(c => {
        const m = MODELS[c.modelId];
        if (!m) return null;
        const tColor = theme.typeColor[m.type];
        return (
          <div key={c.id} style={{ ...cardStyle, borderColor: tColor + '60' }}>
            <div style={cardHeadStyle}>
              <div>
                <div style={nameStyle}>
                  {c.firstName} {m.surname}
                  <span style={{ ...chipStyle, color: tColor, borderColor: tColor }}>{TYPE_INFO[m.type].name}</span>
                </div>
                <div style={subStyle}>
                  Retired at LV {c.level} · contributes <strong style={{ color: theme.color.accent }}>
                  +{(c.level * 0.5).toFixed(1)}% {c.mentorSkill.toUpperCase()}
                  </strong>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </>
  );
}

function CollectionTab() {
  const { state } = useGame();
  const [cardModelId, setCardModelId] = useState<string | null>(null);
  const sorted = [...MODEL_LIST].sort((a, b) => a.dexNo - b.dexNo);

  const cardModel = cardModelId ? MODELS[cardModelId] : null;
  const cardOwned = cardModel ? state.discovered.has(cardModel.id) : false;

  return (
    <div style={dexListStyle}>
      {sorted.map(m => {
        const owned = state.discovered.has(m.id);
        const tColor = theme.typeColor[m.type];
        return (
          <button key={m.id}
            disabled={!owned}
            onClick={() => owned && setCardModelId(m.id)}
            style={{
              ...dexRowStyle,
              display: 'grid',
              gridTemplateColumns: '44px 44px 1fr',
              gap: 10,
              alignItems: 'center',
              width: '100%',
              textAlign: 'left',
              cursor: owned ? 'pointer' : 'not-allowed',
              ...(owned ? { borderColor: tColor + '60' } : { opacity: 0.45 }),
            }}>
            <div style={dexNoStyle}>#{String(m.dexNo).padStart(3, '0')}</div>
            {owned ? <MechaMini modelId={m.id} size="sm" /> : <div style={lockedPortraitStyle} />}
            <div style={dexBodyStyle}>
              {owned ? (
                <>
                  <div style={dexNameStyle}>
                    {m.surname}
                    <span style={{ ...chipStyle, color: tColor, borderColor: tColor }}>{TYPE_INFO[m.type].name}</span>
                    <span style={{ ...rarityChipStyle, color: RARITY_INFO[m.rarity].color }}>{RARITY_INFO[m.rarity].name}</span>
                  </div>
                  <div style={dexFlavorStyle}>{m.flavor}</div>
                </>
              ) : (
                <>
                  <div style={dexNameLockedStyle}>??? ???</div>
                  <div style={dexFlavorStyle}>Unknown chassis.</div>
                </>
              )}
            </div>
          </button>
        );
      })}
      {cardModel && (
        <MechaCard
          mode="dex"
          modelId={cardModel.id}
          owned={cardOwned}
          onClose={() => setCardModelId(null)}
        />
      )}
    </div>
  );
}

const subTabsStyle: CSSProperties = { display: 'flex', gap: 4, marginBottom: theme.space.md };

const cardStyle: CSSProperties = {
  background: theme.color.bgRaised, border: '1px solid', marginBottom: 8, transition: 'border-color 0.15s',
};
const cardHeadStyle: CSSProperties = {
  width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
  padding: theme.space.md, background: 'transparent', border: 'none', color: theme.color.text,
  cursor: 'pointer', textAlign: 'left',
};
const nameStyle: CSSProperties = {
  fontFamily: theme.font.display, fontSize: theme.size.h3, letterSpacing: theme.letter.wide,
  color: '#fff', display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap',
};
const subStyle: CSSProperties = {
  fontFamily: theme.font.mono, fontSize: theme.size.tiny, color: theme.color.textMuted, marginTop: 2,
};
const chipStyle: CSSProperties = {
  fontFamily: theme.font.mono, fontSize: theme.size.micro, letterSpacing: theme.letter.normal,
  padding: '2px 6px', border: '1px solid', borderRadius: 2,
};
const chevronStyle: CSSProperties = { fontSize: 20, color: theme.color.accent };
const detailStyle: CSSProperties = { padding: theme.space.md, borderTop: `1px solid ${theme.color.border}` };
const statsRowStyle: CSSProperties = {
  display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6,
  fontFamily: theme.font.mono, fontSize: theme.size.tiny, color: theme.color.textMuted, marginBottom: theme.space.sm,
};
const metaRowStyle: CSSProperties = {
  display: 'flex', justifyContent: 'space-between',
  fontFamily: theme.font.mono, fontSize: theme.size.tiny, color: theme.color.info, marginBottom: theme.space.sm,
};
const equipRowStyle: CSSProperties = {
  display: 'flex', justifyContent: 'space-between',
  fontFamily: theme.font.mono, fontSize: theme.size.small, marginTop: 4,
};
const equipLabelStyle: CSSProperties = {
  fontSize: theme.size.micro, color: theme.color.textDim, letterSpacing: theme.letter.wide,
};
const emptyStyle: CSSProperties = {
  padding: theme.space.lg, textAlign: 'center',
  color: theme.color.textDim, fontSize: theme.size.small, fontStyle: 'italic',
};

const dexListStyle: CSSProperties = { display: 'flex', flexDirection: 'column', gap: 4 };
const dexRowStyle: CSSProperties = {
  display: 'grid', gridTemplateColumns: '52px 1fr', gap: theme.space.sm,
  alignItems: 'center', padding: '8px 10px',
  background: theme.color.bgRaised, border: `1px solid ${theme.color.border}`,
};
const lockedPortraitStyle: CSSProperties = {
  width: 36, height: 36,
  background: theme.color.bgSunken,
  border: `1px dashed ${theme.color.border}`,
};
const dexNoStyle: CSSProperties = {
  fontFamily: theme.font.mono, fontSize: theme.size.small, color: theme.color.textDim,
  letterSpacing: theme.letter.tight,
};
const dexBodyStyle: CSSProperties = { minWidth: 0 };
const dexNameStyle: CSSProperties = {
  fontFamily: theme.font.display, fontSize: theme.size.body,
  color: theme.color.text, display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap',
};
const dexNameLockedStyle: CSSProperties = {
  fontFamily: theme.font.display, fontSize: theme.size.body,
  color: theme.color.textVeryDim, letterSpacing: theme.letter.wide,
};
const rarityChipStyle: CSSProperties = {
  fontFamily: theme.font.mono, fontSize: theme.size.micro,
  letterSpacing: theme.letter.normal,
};
const dexFlavorStyle: CSSProperties = {
  fontFamily: theme.font.body, fontStyle: 'italic',
  fontSize: theme.size.tiny, color: theme.color.textDim, marginTop: 2,
};

/**
 * BotMoves — inline move display for the Stable detail view.
 *
 * Shows:
 *   - The bot's 3 model attack slots (with name, type, power, accuracy)
 *   - The signature attack from the equipped weapon (gold border, if any)
 *
 * Read-only for now; tap a move to see its description in a tooltip-like row.
 * Replacement happens through the LearnMoveScreen at level-up.
 */
function BotMoves({ bot }: { bot: Bot }) {
  const attacks = getActiveAttacks(bot);
  const sig = getSignatureAttack(bot);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  return (
    <div style={{ marginTop: 8 }}>
      <div style={{ ...equipRowStyle, marginBottom: 6 }}>
        <span style={equipLabelStyle}>MOVES</span>
        <span style={{ fontSize: theme.size.tiny, color: theme.color.textDim }}>{attacks.length}/3 model{sig ? ' + 1 weapon' : ''}</span>
      </div>
      {attacks.map(a => {
        const isOpen = expandedId === a.id;
        return (
          <button key={a.id}
            onClick={() => setExpandedId(isOpen ? null : a.id)}
            style={moveRowStyle}>
            <div style={moveHeadStyle}>
              <span style={moveNameStyle}>{a.name}</span>
              <span style={{ fontSize: theme.size.micro, color: a.type === 'physical' ? theme.color.text : theme.typeColor[a.type] }}>
                {a.type.toUpperCase()}
              </span>
            </div>
            <div style={moveStatsStyle}>PWR {a.power} · ACC {a.accuracy}%</div>
            {isOpen && <div style={moveDescStyle}>{a.desc}</div>}
          </button>
        );
      })}
      {sig && (
        <button onClick={() => setExpandedId(expandedId === sig.id ? null : sig.id)}
          style={{ ...moveRowStyle, borderColor: theme.color.gold }}>
          <div style={moveHeadStyle}>
            <span style={moveNameStyle}>★ {sig.name}</span>
            <span style={{ fontSize: theme.size.micro, color: theme.color.gold }}>SIG</span>
          </div>
          <div style={moveStatsStyle}>PWR {sig.power} · ACC {sig.accuracy}%</div>
          {expandedId === sig.id && <div style={moveDescStyle}>{sig.desc}</div>}
        </button>
      )}
    </div>
  );
}

const moveRowStyle: CSSProperties = {
  display: 'block',
  width: '100%',
  padding: '6px 8px',
  marginBottom: 4,
  background: theme.color.panel,
  border: `1px solid ${theme.color.border}`,
  cursor: 'pointer',
  textAlign: 'left',
  color: theme.color.text,
  font: 'inherit',
};
const moveHeadStyle: CSSProperties = {
  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
};
const moveNameStyle: CSSProperties = {
  fontFamily: theme.font.display, fontSize: theme.size.small,
  letterSpacing: theme.letter.tight, color: '#fff',
};
const moveStatsStyle: CSSProperties = {
  fontFamily: theme.font.mono, fontSize: theme.size.micro,
  color: theme.color.textMuted, marginTop: 2,
};
const moveDescStyle: CSSProperties = {
  fontFamily: theme.font.body, fontStyle: 'italic',
  fontSize: theme.size.tiny, color: theme.color.textDim, marginTop: 4, lineHeight: 1.4,
};

// ----- promote to crew confirm -----
const confirmBoxStyle: CSSProperties = {
  marginTop: theme.space.sm,
  padding: theme.space.sm,
  background: theme.color.bgSunken,
  border: `1px solid ${theme.color.accent}`,
};
const confirmTextStyle: CSSProperties = {
  fontSize: theme.size.tiny,
  color: theme.color.text,
  lineHeight: 1.5,
  marginBottom: theme.space.sm,
};
const confirmButtonsStyle: CSSProperties = {
  display: 'flex',
  gap: 6,
};

// ----- crew tab summary -----
const crewSummaryStyle: CSSProperties = {
  padding: theme.space.md,
  background: theme.color.bgRaised,
  border: `1px solid ${theme.color.accent}`,
  marginBottom: theme.space.md,
};
const crewSummaryHeadStyle: CSSProperties = {
  fontFamily: theme.font.display,
  fontSize: theme.size.tiny,
  letterSpacing: theme.letter.wide,
  color: theme.color.accent,
  marginBottom: theme.space.sm,
  textAlign: 'center',
};
const crewBonusRowStyle: CSSProperties = {
  display: 'flex',
  justifyContent: 'space-around',
  fontFamily: theme.font.mono,
  fontSize: theme.size.small,
  color: theme.color.text,
  fontWeight: 800,
};

// Corner bracket helper for emphasis on expanded cards
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
