import { CSSProperties, useState } from 'react';
import { useGame } from '../state/GameStore';
import { useBattleOrchestrator } from '../hooks/useBattleOrchestrator';
import { PartyBotMini } from '../components/PartyBotMini';
import { theme } from '../styles/theme';
import { useCityPalette } from '../styles/cityPalette';
import { BracketLabel } from '../components/Frame';
import { ATTACKS } from '../data/attacks';
import { ITEMS } from '../data/items';
import { TYPE_INFO } from '../data/types';
import { getActiveAttacks, getSignatureAttack } from '../game/combat';

export function CombatScreen() {
  const { state, dispatch } = useGame();
  const palette = useCityPalette();
  const { pickTarget, pickItem, defend, selfRepair, selfCharge, abandon } = useBattleOrchestrator();
  const cs = state.combat;
  const [showOther, setShowOther] = useState(false);
  if (!cs) return null;

  const playerActable = cs.player.filter(b => b.hp > 0 && !b.actedThisRound);
  const currentBot = cs.selectedBot ? cs.player.find(b => b.id === cs.selectedBot) ?? null : null;

  const appStyleDyn: CSSProperties = {
    ...appStyle,
    background: `
      radial-gradient(ellipse at top, ${palette.c5}80 0%, ${theme.color.bg} 60%, #000 100%)
    `,
  };
  const headerStyleDyn: CSSProperties = {
    ...headerStyle,
    borderBottom: `1px solid ${palette.c1}80`,
    background: `linear-gradient(180deg, ${palette.c5}80 0%, ${theme.color.bgRaised} 100%)`,
  };
  const turnStyleDyn: CSSProperties = {
    ...turnStyle,
    color: palette.c1,
    textShadow: `0 0 8px ${palette.c1}80`,
  };

  const messageColor = (() => {
    if (!cs.message?.emphasis) return theme.color.text;
    if (cs.message.emphasis === 'crit') return theme.color.gold;
    if (cs.message.emphasis === 'super') return theme.color.danger;
    if (cs.message.emphasis === 'resisted') return theme.color.info;
    if (cs.message.emphasis === 'miss') return theme.color.textDim;
    if (cs.message.emphasis === 'status') return theme.color.warning;
    return theme.color.text;
  })();

  return (
    <div style={appStyleDyn}>
      <header style={headerStyleDyn}>
        <div style={titleStyle}>
          ROUND {cs.battleRound}
          {cs.maxTournamentRound && cs.maxTournamentRound > 1 && ` · R${cs.tournamentRound}/${cs.maxTournamentRound}`}
        </div>
        <div style={turnStyleDyn}>
          {cs.phase === 'enemy_turn' ? 'OPPONENT TURN' :
           cs.phase === 'player_select' ? `${playerActable.length} TO ACT` :
           cs.phase === 'bot_choose' ? 'PICK BOT' :
           cs.phase === 'attack_choose' ? 'PICK ATTACK' :
           cs.phase === 'item_choose' ? 'PICK ITEM' :
           cs.phase === 'target_choose' ? 'PICK TARGET' : ''}
        </div>
      </header>

      {/* OPPONENTS — top */}
      <div style={partyStyle}>
        <div style={partyLabelStyle}>OPPONENTS</div>
        <div style={partyGridStyle}>
          {cs.opp.map(b => {
            const atk = cs.selectedAttack ? ATTACKS[cs.selectedAttack] : null;
            const targetable = cs.phase === 'target_choose' && !atk?.allyTarget;
            return (
              <PartyBotMini key={b.id} bot={b} side="opp"
                isTargetable={targetable}
                onTap={() => targetable && pickTarget(b.id)} />
            );
          })}
        </div>
      </div>

      {/* MID-SCREEN MESSAGE */}
      <div style={messageContainerStyle}>
        {cs.message && (
          <div style={{ ...messageStyle, color: messageColor }} className="ic-fade-in" key={cs.message.text}>
            {cs.message.text}
          </div>
        )}
      </div>

      {/* PLAYER — bottom */}
      <div style={partyStyle}>
        <div style={partyLabelStyle}>YOUR TEAM</div>
        <div style={partyGridStyle}>
          {cs.player.map(b => {
            const atk = cs.selectedAttack ? ATTACKS[cs.selectedAttack] : null;
            const allyTargetable = cs.phase === 'target_choose' && atk?.allyTarget && b.id !== cs.selectedBot && b.hp > 0;
            return (
              <PartyBotMini key={b.id} bot={b} side="player"
                isCurrent={cs.selectedBot === b.id}
                isPickable={cs.phase === 'bot_choose'}
                isTargetable={!!allyTargetable}
                onTap={() => {
                  if (allyTargetable) { pickTarget(b.id); return; }
                  if (cs.phase !== 'bot_choose') return;
                  if (cs.action === 'defend') {
                    defend(b.id);
                  } else if (cs.action === 'self_repair') {
                    selfRepair(b.id);
                  } else if (cs.action === 'self_charge') {
                    selfCharge(b.id);
                  } else {
                    dispatch({ type: 'COMBAT_PICK_BOT', botId: b.id });
                  }
                }} />
            );
          })}
        </div>
      </div>

      {/* ACTION PANEL */}
      <div style={panelStyle}>
        {cs.phase === 'enemy_turn' && (
          <div style={waitingStyle}>
            <span style={spinnerStyle}>◆</span>
            <span>Opponent acting...</span>
          </div>
        )}

        {cs.phase === 'player_select' && (
          <div style={mainMenuStyle}>
            <button style={actionBtnStyle} onClick={() => dispatch({ type: 'COMBAT_PICK_ACTION', action: 'attack' })}>
              <span style={actionLabelStyle}>ATTACK</span>
            </button>
            <button style={actionBtnStyle} onClick={() => dispatch({ type: 'COMBAT_PICK_ACTION', action: 'item' })}>
              <span style={actionLabelStyle}>ITEM</span>
              <span style={actionSubStyle}>{Object.values(state.items).reduce((s, c) => s + c, 0)} bag</span>
            </button>
            <button style={actionBtnStyle} onClick={() => setShowOther(true)}>
              <span style={actionLabelStyle}>OTHER</span>
              <span style={actionSubStyle}>defend / repair / charge</span>
            </button>
          </div>
        )}

        {showOther && (
          <div style={otherMenuOverlayStyle} onClick={() => setShowOther(false)}>
            <div style={otherMenuStyle} onClick={e => e.stopPropagation()}>
              <div style={otherMenuTitleStyle}>OTHER ACTIONS</div>
              <button style={otherOptStyle} onClick={() => { setShowOther(false); dispatch({ type: 'COMBAT_PICK_ACTION', action: 'defend' }); }}>
                <span style={otherOptLabelStyle}>DEFEND</span>
                <span style={otherOptDescStyle}>+30% DEF this round · free</span>
              </button>
              <button style={otherOptStyle} onClick={() => { setShowOther(false); dispatch({ type: 'COMBAT_PICK_ACTION', action: 'self_repair' }); }}>
                <span style={otherOptLabelStyle}>SELF-REPAIR</span>
                <span style={otherOptDescStyle}>+5% max HP · free</span>
              </button>
              <button style={otherOptStyle} onClick={() => { setShowOther(false); dispatch({ type: 'COMBAT_PICK_ACTION', action: 'self_charge' }); }}>
                <span style={otherOptLabelStyle}>SELF-CHARGE</span>
                <span style={otherOptDescStyle}>+5% max battery · free</span>
              </button>
              <button style={{ ...otherOptStyle, borderColor: theme.color.danger }} onClick={() => { setShowOther(false); if (confirm('Abandon the fight?')) { abandon(); } }}>
                <span style={{ ...otherOptLabelStyle, color: theme.color.danger }}>ABANDON FIGHT</span>
                <span style={otherOptDescStyle}>Forfeit. Tournament resets to round 1.</span>
              </button>
              <button style={otherCancelStyle} onClick={() => setShowOther(false)}>CANCEL</button>
            </div>
          </div>
        )}

        {cs.phase === 'bot_choose' && (
          <div style={subMenuStyle}>
            <button style={backBtnStyle} onClick={() => dispatch({ type: 'COMBAT_BACK', toPhase: 'player_select' })}>
              ← BACK
            </button>
            <div style={promptStyle}>
              {cs.action === 'attack' ? 'Tap a bot below to act with' :
               cs.action === 'item' ? 'Tap a bot below to use the item on' :
               cs.action === 'defend' ? 'Tap a bot below to brace' :
               cs.action === 'self_repair' ? 'Tap a bot below to self-repair (+5% HP)' :
               cs.action === 'self_charge' ? 'Tap a bot below to self-charge (+5% BAT)' :
               'Tap a bot below'}
            </div>
          </div>
        )}

        {cs.phase === 'attack_choose' && currentBot && (
          <AttackPicker bot={currentBot} battleRound={cs.battleRound} />
        )}

        {cs.phase === 'item_choose' && (
          <div style={subMenuStyle}>
            <button style={backBtnStyle} onClick={() => dispatch({ type: 'COMBAT_BACK', toPhase: 'bot_choose' })}>
              ← BACK
            </button>
            <div style={attackListStyle}>
              {Object.entries(state.items).map(([id, count]) => {
                if (count <= 0) return null;
                const it = ITEMS[id];
                if (!it) return null;
                return (
                  <button key={id} style={attackOptionStyle} onClick={() => pickItem(id)}>
                    <div style={attackHeadStyle}>
                      <span style={attackNameStyle}>{it.name}</span>
                      <span style={attackTypeStyle}>×{count}</span>
                    </div>
                    <div style={attackDescStyle}>{it.desc}</div>
                  </button>
                );
              })}
              {Object.values(state.items).every(c => c <= 0) && (
                <div style={emptyBagStyle}>Empty bag.</div>
              )}
            </div>
          </div>
        )}

        {cs.phase === 'target_choose' && cs.selectedAttack && (() => {
          const atk = ATTACKS[cs.selectedAttack];
          return (
            <div style={subMenuStyle}>
              <button style={backBtnStyle} onClick={() => dispatch({ type: 'COMBAT_BACK', toPhase: 'attack_choose' })}>
                ← BACK
              </button>
              <div style={promptStyle}>
                {atk.name} → tap {atk.allyTarget ? 'an ally below (not self)' : 'an opponent above'}
              </div>
            </div>
          );
        })()}
      </div>
    </div>
  );
}

function AttackPicker({ bot, battleRound }: { bot: import('../game/combat').CombatBot; battleRound: number }) {
  const { dispatch } = useGame();
  const attacks = getActiveAttacks({ modelId: bot.modelId, learnedAttacks: bot.learnedAttacks });
  const sig = getSignatureAttack({ weapon: bot.weapon });
  const sigOk = sig && battleRound >= 3 && bot.signatureUsesLeft > 0 && bot.bat >= sig.batteryCost;
  return (
    <div style={subMenuStyle}>
      <button style={backBtnStyle} onClick={() => dispatch({ type: 'COMBAT_BACK', toPhase: 'player_select' })}>
        ← BACK
      </button>
      <div style={actingStyle}>
        ACTING: <span style={{ color: theme.color.accent }}>{bot.firstName}</span>
        {' · '}<span style={{ color: theme.color.info }}>{bot.bat}/{bot.maxBattery} BAT</span>
      </div>
      <div style={attackListStyle}>
        {attacks.map(a => {
          const canAfford = bot.bat >= a.batteryCost;
          return (
            <button key={a.id} disabled={!canAfford}
              style={{ ...attackOptionStyle, ...(canAfford ? {} : { opacity: 0.4, cursor: 'not-allowed' }) }}
              onClick={() => canAfford && dispatch({ type: 'COMBAT_PICK_ATTACK', attackId: a.id, isSignature: false })}>
              <div style={attackHeadStyle}>
                <span style={attackNameStyle}>{a.name}{a.allyTarget && ' →ally'}</span>
                <span style={{ ...attackTypeStyle, color: a.type === 'physical' ? theme.color.text : theme.typeColor[a.type] ?? theme.color.text }}>
                  {a.type.toUpperCase()}
                </span>
              </div>
              <div style={attackStatsStyle}>
                {a.allyTarget && a.chargeRestore ? `+${a.chargeRestore} BAT` : `PWR ${a.power}`}
                {' · '}ACC {a.accuracy}%
                <span style={{ color: theme.color.info, marginLeft: 6 }}>· {a.batteryCost} BAT</span>
              </div>
              {!canAfford && (
                <div style={lockHintStyle}>Not enough battery</div>
              )}
            </button>
          );
        })}
        {sig && (
          <button
            disabled={!sigOk}
            onClick={() => sigOk && dispatch({ type: 'COMBAT_PICK_ATTACK', attackId: sig.id, isSignature: true })}
            style={{ ...attackOptionStyle, borderColor: theme.color.gold, ...(sigOk ? {} : { opacity: 0.4 }) }}>
            <div style={attackHeadStyle}>
              <span style={attackNameStyle}>★ {sig.name} <span style={{ color: theme.color.gold, fontSize: 9 }}>SIGNATURE</span></span>
              <span style={{ ...attackTypeStyle, color: sig.type === 'physical' ? theme.color.text : theme.typeColor[sig.type] }}>
                {sig.type.toUpperCase()}
              </span>
            </div>
            <div style={attackStatsStyle}>
              PWR {sig.power} · ACC {sig.accuracy}% · {bot.signatureUsesLeft}/2 uses
              <span style={{ color: theme.color.info, marginLeft: 6 }}>· {sig.batteryCost} BAT</span>
            </div>
            {!sigOk && (
              <div style={lockHintStyle}>
                {battleRound < 3 ? `Unlocks round 3 (now: ${battleRound})` :
                 bot.signatureUsesLeft <= 0 ? 'Out of uses' :
                 bot.bat < sig.batteryCost ? `Needs ${sig.batteryCost} battery (have ${bot.bat})` : 'Locked'}
              </div>
            )}
          </button>
        )}
      </div>
    </div>
  );
}

const appStyle: CSSProperties = {
  minHeight: '100vh',
  background: 'radial-gradient(ellipse at top, #15151a 0%, #050507 60%, #000 100%)',
  color: theme.color.text,
  fontFamily: theme.font.body,
  display: 'flex',
  flexDirection: 'column',
  maxWidth: theme.maxWidth,
  margin: '0 auto',
};

const headerStyle: CSSProperties = {
  padding: '10px 14px',
  borderBottom: `1px solid ${theme.color.accent}4d`,
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  background: theme.color.bgRaised,
};

const titleStyle: CSSProperties = {
  fontFamily: theme.font.display,
  fontSize: 14,
  letterSpacing: theme.letter.wide,
  color: '#fff',
};

const turnStyle: CSSProperties = {
  fontFamily: theme.font.mono,
  fontSize: theme.size.tiny,
  color: theme.color.accent,
  letterSpacing: theme.letter.normal,
  animation: 'ic-pulse 1.5s infinite',
};

const partyStyle: CSSProperties = { padding: '8px 14px' };

const partyLabelStyle: CSSProperties = {
  fontFamily: theme.font.mono,
  fontSize: theme.size.micro,
  color: theme.color.textDim,
  letterSpacing: theme.letter.wide,
  marginBottom: 4,
};

const partyGridStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(90px, 1fr))',
  gap: 6,
};

const messageContainerStyle: CSSProperties = {
  padding: '12px 14px',
  minHeight: 50,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

const messageStyle: CSSProperties = {
  fontFamily: theme.font.mono,
  fontSize: theme.size.body,
  letterSpacing: theme.letter.tight,
  textAlign: 'center',
  fontWeight: 600,
  padding: '8px 14px',
  background: theme.color.bgSunken,
  border: `1px solid ${theme.color.border}`,
  borderRadius: 2,
  width: '100%',
};

const panelStyle: CSSProperties = {
  margin: '8px 14px 14px',
  padding: 10,
  background: theme.color.bgRaised,
  border: `1px solid ${theme.color.accent}4d`,
  minHeight: 110,
};

const waitingStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 10,
  padding: 14,
  color: theme.color.textMuted,
  fontFamily: theme.font.mono,
  fontSize: theme.size.small,
  letterSpacing: theme.letter.normal,
};

const spinnerStyle: CSSProperties = {
  color: theme.color.accent,
  fontSize: 16,
  animation: 'ic-pulse 0.8s infinite',
};

const mainMenuStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: '1fr 1fr 1fr',
  gap: 6,
};

const actionBtnStyle: CSSProperties = {
  padding: '14px 6px',
  background: theme.color.panel,
  border: `1px solid ${theme.color.accent}`,
  color: theme.color.accent,
  display: 'flex',
  flexDirection: 'column',
  gap: 2,
  cursor: 'pointer',
};

const actionLabelStyle: CSSProperties = {
  fontFamily: theme.font.display,
  fontSize: 13,
  letterSpacing: theme.letter.wide,
};

const actionSubStyle: CSSProperties = {
  fontFamily: theme.font.mono,
  fontSize: 8,
  color: theme.color.textMuted,
};

const subMenuStyle: CSSProperties = { display: 'flex', flexDirection: 'column', gap: 5 };

const backBtnStyle: CSSProperties = {
  alignSelf: 'flex-start',
  background: 'transparent',
  border: 'none',
  color: theme.color.textMuted,
  fontFamily: theme.font.mono,
  fontSize: theme.size.micro,
  letterSpacing: theme.letter.wide,
  padding: 0,
  cursor: 'pointer',
};

const promptStyle: CSSProperties = {
  padding: 10,
  background: '#1a0f0a',
  border: `1px dashed ${theme.color.accent}`,
  color: theme.color.accent,
  fontFamily: theme.font.mono,
  fontSize: theme.size.small,
  textAlign: 'center',
  letterSpacing: theme.letter.normal,
};

const actingStyle: CSSProperties = {
  padding: 8,
  background: theme.color.bgRaised,
  borderTop: `2px solid ${theme.color.accent}`,
  fontFamily: theme.font.mono,
  fontSize: theme.size.tiny,
  color: theme.color.textMuted,
  letterSpacing: theme.letter.wide,
  textAlign: 'center',
};

const attackListStyle: CSSProperties = { display: 'flex', flexDirection: 'column', gap: 4 };

const attackOptionStyle: CSSProperties = {
  padding: 8,
  background: theme.color.panel,
  border: `1px solid ${theme.color.borderStrong}`,
  color: theme.color.text,
  textAlign: 'left',
  display: 'flex',
  flexDirection: 'column',
  gap: 2,
  cursor: 'pointer',
};

const attackHeadStyle: CSSProperties = { display: 'flex', justifyContent: 'space-between', alignItems: 'center' };
const attackNameStyle: CSSProperties = { fontFamily: theme.font.display, fontSize: 13, letterSpacing: theme.letter.normal };
const attackTypeStyle: CSSProperties = { fontFamily: theme.font.mono, fontSize: 9, letterSpacing: theme.letter.normal };
const attackStatsStyle: CSSProperties = { fontFamily: theme.font.mono, fontSize: 9, color: theme.color.info };
const attackDescStyle: CSSProperties = { fontSize: 10, color: theme.color.textMuted, fontStyle: 'italic' };
const emptyBagStyle: CSSProperties = { padding: 12, textAlign: 'center', color: theme.color.textDim, fontSize: theme.size.small };
const lockHintStyle: CSSProperties = { fontFamily: theme.font.mono, fontSize: 9, color: theme.color.danger, marginTop: 4, letterSpacing: theme.letter.tight };

// ----- OTHER menu modal -----
const otherMenuOverlayStyle: CSSProperties = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  background: 'rgba(0,0,0,0.85)',
  // Allow vertical scrolling when modal content exceeds viewport (tablet portrait, short screens)
  overflowY: 'auto',
  overflowX: 'hidden',
  zIndex: 500,
  // Padding-bottom protects against the BottomNav (~60px) on small viewports
  padding: '20px 16px 80px',
  WebkitOverflowScrolling: 'touch',
  // Anchor content to top — modal grows downward and scrolls if needed.
  // Vertical centering via flex caused overflow content to disappear above the
  // viewport on some Android tablets, so we avoid it.
  display: 'block',
};
const otherMenuStyle: CSSProperties = {
  width: '100%',
  maxWidth: 360,
  margin: '0 auto',
  background: theme.color.bgRaised,
  border: `1px solid ${theme.color.accent}`,
  padding: 16,
  display: 'flex',
  flexDirection: 'column',
  gap: 6,
};
const otherMenuTitleStyle: CSSProperties = {
  fontFamily: theme.font.display,
  fontSize: theme.size.h3,
  letterSpacing: theme.letter.wider,
  color: '#fff',
  textAlign: 'center',
  marginBottom: 6,
};
const otherOptStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
  gap: 2,
  padding: '10px 12px',
  background: theme.color.bgSunken,
  border: `1px solid ${theme.color.border}`,
  color: theme.color.text,
  fontFamily: theme.font.body,
  textAlign: 'left',
  cursor: 'pointer',
};
const otherOptLabelStyle: CSSProperties = {
  fontFamily: theme.font.display,
  fontSize: theme.size.body,
  letterSpacing: theme.letter.wide,
  color: '#fff',
};
const otherOptDescStyle: CSSProperties = {
  fontSize: 10,
  color: theme.color.textDim,
  fontStyle: 'italic',
};
const otherCancelStyle: CSSProperties = {
  marginTop: 6,
  padding: '8px',
  background: 'transparent',
  border: `1px solid ${theme.color.border}`,
  color: theme.color.textMuted,
  fontFamily: theme.font.mono,
  fontSize: theme.size.tiny,
  letterSpacing: theme.letter.wide,
  cursor: 'pointer',
};
