import { CSSProperties, useState } from 'react';
import { useGame } from '../state/GameStore';
import { Shell } from '../components/Shell';
import { Button } from '../components/Button';
import { theme } from '../styles/theme';
import { MODELS, MODEL_LIST, TOTAL_DEX, RARITY_INFO } from '../data/models';
import { WEAPONS } from '../data/weapons';
import { ARMORS } from '../data/armors';
import { TYPE_INFO } from '../data/types';
import { getBotStats, getBotPower, calcMentorBonuses, getDiskCapacity } from '../game/stats';
import { getBotFullName } from '../game/display';

type Tab = 'roster' | 'collection';

/**
 * StableScreen — top-level tab with two sub-tabs.
 *
 * ROSTER     → expandable cards for each active bot in your stable
 * COLLECTION → dex view: every model in MODELS, owned ones shown by name,
 *              undiscovered ones shown as ???
 */
export function StableScreen() {
  const { state } = useGame();
  const [tab, setTab] = useState<Tab>('roster');

  return (
    <Shell>
      <div style={titleStyle}>YOUR STABLE</div>

      <div style={subTabsStyle}>
        <button onClick={() => setTab('roster')}
          style={{ ...subTabStyle, ...(tab === 'roster' ? activeSubTabStyle : {}) }}>
          ROSTER · {state.bots.length}/5
        </button>
        <button onClick={() => setTab('collection')}
          style={{ ...subTabStyle, ...(tab === 'collection' ? activeSubTabStyle : {}) }}>
          COLLECTION · {state.discovered.size}/{TOTAL_DEX}
        </button>
      </div>

      {tab === 'roster' && <RosterTab />}
      {tab === 'collection' && <CollectionTab />}
    </Shell>
  );
}

function RosterTab() {
  const { state, dispatch } = useGame();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const mentorBonuses = calcMentorBonuses(state.crew);

  if (state.bots.length === 0) {
    return <div style={emptyStyle}>No bots yet. Visit the workshop or the Voltspire market.</div>;
  }

  return (
    <>
      {state.bots.map(bot => {
        const m = MODELS[bot.modelId];
        const t = TYPE_INFO[m.type];
        const stats = getBotStats(bot, mentorBonuses);
        const power = getBotPower(bot, mentorBonuses);
        const tColor = theme.typeColor[m.type];
        const isOpen = expandedId === bot.id;
        const cap = getDiskCapacity(bot);

        return (
          <div key={bot.id} style={{ ...cardStyle, borderColor: isOpen ? tColor : theme.color.border }}>
            <button style={cardHeadStyle} onClick={() => setExpandedId(isOpen ? null : bot.id)}>
              <div>
                <div style={nameStyle}>
                  {getBotFullName(bot)}
                  <span style={{ ...chipStyle, color: tColor, borderColor: tColor }}>{t.name}</span>
                </div>
                <div style={subStyle}>LV {bot.level} · PWR {power}</div>
              </div>
              <div style={chevronStyle}>{isOpen ? '−' : '+'}</div>
            </button>

            {isOpen && (
              <div style={detailStyle}>
                <div style={statsRowStyle}>
                  <div>ATK <strong>{stats.attack}</strong></div>
                  <div>DEF <strong>{stats.defense}</strong></div>
                  <div>SPD <strong>{stats.speed}</strong></div>
                  <div>INT <strong>{stats.intelligence}</strong></div>
                </div>
                <div style={metaRowStyle}>
                  <div>HP {bot.maxHp}</div>
                  <div>W: {bot.wins} L: {bot.losses}</div>
                  <div>Disks {bot.disksUsed}/{cap}</div>
                </div>
                <div style={equipRowStyle}>
                  <span style={equipLabelStyle}>WEAPON</span>
                  <span>{bot.weapon ? WEAPONS[bot.weapon]?.name : '—'}</span>
                </div>
                <div style={equipRowStyle}>
                  <span style={equipLabelStyle}>ARMOR</span>
                  <span>{bot.armor ? ARMORS[bot.armor]?.name : '—'}</span>
                </div>
                {bot.learnedAttacks.length > 0 && (
                  <div style={equipRowStyle}>
                    <span style={equipLabelStyle}>LEARNED</span>
                    <span style={{ fontSize: theme.size.tiny }}>{bot.learnedAttacks.join(', ')}</span>
                  </div>
                )}
                <Button full variant="secondary" small style={{ marginTop: theme.space.md }}
                  onClick={() => dispatch({ type: 'OPEN_ASSIGN', botId: bot.id })}>
                  ASSIGN ITEMS →
                </Button>
              </div>
            )}
          </div>
        );
      })}
    </>
  );
}

function CollectionTab() {
  const { state } = useGame();
  const sorted = [...MODEL_LIST].sort((a, b) => a.dexNo - b.dexNo);

  return (
    <div style={dexListStyle}>
      {sorted.map(m => {
        const owned = state.discovered.has(m.id);
        const tColor = theme.typeColor[m.type];
        return (
          <div key={m.id} style={{
            ...dexRowStyle,
            ...(owned ? { borderColor: tColor + '60' } : { opacity: 0.5 }),
          }}>
            <div style={dexNoStyle}>#{String(m.dexNo).padStart(3, '0')}</div>
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
          </div>
        );
      })}
    </div>
  );
}

const titleStyle: CSSProperties = {
  fontFamily: theme.font.display, fontSize: theme.size.h1,
  letterSpacing: theme.letter.wider, color: '#fff', marginBottom: theme.space.md,
};

const subTabsStyle: CSSProperties = { display: 'flex', gap: 4, marginBottom: theme.space.md };

const subTabStyle: CSSProperties = {
  flex: 1, padding: '8px 4px',
  background: 'transparent', color: theme.color.textDim,
  fontFamily: theme.font.display, fontSize: 11, letterSpacing: theme.letter.wide,
  border: '1px solid transparent', cursor: 'pointer',
};

const activeSubTabStyle: CSSProperties = {
  background: theme.color.panel, color: theme.color.accent,
  borderBottom: `2px solid ${theme.color.accent}`,
};

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
