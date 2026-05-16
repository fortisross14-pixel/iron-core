import { CSSProperties } from 'react';
import { useGame } from '../state/GameStore';
import { Shell } from '../components/Shell';
import { Button } from '../components/Button';
import { theme } from '../styles/theme';
import { MODELS } from '../data/models';
import { WEAPONS } from '../data/weapons';
import { ARMORS } from '../data/armors';
import { DISKS } from '../data/disks';
import { TYPE_INFO } from '../data/types';
import { getBotType, getDiskCapacity } from '../game/stats';
import { getBotFullName } from '../game/display';

/**
 * AssignItemScreen — the assign-item flow.
 *
 * Three states inside this single screen:
 *   1. Category picker (when assignItemContext.category is null)
 *   2. Item picker (when category is set)
 *   3. (Confirmation happens inline on each item card)
 *
 * Unequip buttons appear in state 1.
 */
export function AssignItemScreen() {
  const { state, dispatch } = useGame();
  const ctx = state.assignItemContext;
  if (!ctx) return null;
  const bot = state.bots.find(b => b.id === ctx.botId);
  if (!bot) return null;
  const botType = getBotType(bot);

  // ===== STATE 1: CATEGORY PICKER =====
  if (!ctx.category) {
    return (
      <Shell>
        <button onClick={() => dispatch({ type: 'ASSIGN_CLOSE' })} style={backStyle}>← BACK TO STABLE</button>
        <div style={titleStyle}>ASSIGN ITEM</div>
        <div style={subStyle}>{getBotFullName(bot)} · {TYPE_INFO[botType].name}</div>

        {/* WEAPON SLOT */}
        <div style={slotStyle}>
          <div style={slotLabelStyle}>WEAPON</div>
          <div style={slotValueStyle}>
            {bot.weapon ? WEAPONS[bot.weapon]?.name : <span style={emptySlotStyle}>—</span>}
          </div>
          <div style={slotBtnRowStyle}>
            <Button small variant="secondary" onClick={() => dispatch({ type: 'ASSIGN_CATEGORY', category: 'weapon' })}>
              {bot.weapon ? 'SWAP' : 'EQUIP'}
            </Button>
            {bot.weapon && (
              <Button small variant="danger" onClick={() => dispatch({ type: 'ASSIGN_UNEQUIP', botId: bot.id, category: 'weapon' })}>
                UNEQUIP
              </Button>
            )}
          </div>
        </div>

        {/* ARMOR SLOT */}
        <div style={slotStyle}>
          <div style={slotLabelStyle}>ARMOR</div>
          <div style={slotValueStyle}>
            {bot.armor ? ARMORS[bot.armor]?.name : <span style={emptySlotStyle}>—</span>}
          </div>
          <div style={slotBtnRowStyle}>
            <Button small variant="secondary" onClick={() => dispatch({ type: 'ASSIGN_CATEGORY', category: 'armor' })}>
              {bot.armor ? 'SWAP' : 'EQUIP'}
            </Button>
            {bot.armor && (
              <Button small variant="danger" onClick={() => dispatch({ type: 'ASSIGN_UNEQUIP', botId: bot.id, category: 'armor' })}>
                UNEQUIP
              </Button>
            )}
          </div>
        </div>

        {/* DISK SLOTS */}
        <div style={slotStyle}>
          <div style={slotLabelStyle}>DISKS · {bot.disksUsed}/{getDiskCapacity(bot)}</div>
          <div style={slotValueStyle}>
            <span style={{ color: theme.color.textMuted, fontSize: theme.size.tiny }}>
              Stat: +{bot.statBoosts.attack}A +{bot.statBoosts.defense}D +{bot.statBoosts.speed}S · Learned: {bot.learnedAttacks.length}
            </span>
          </div>
          <div style={slotBtnRowStyle}>
            <Button small variant="secondary"
              disabled={bot.disksUsed >= getDiskCapacity(bot)}
              onClick={() => dispatch({ type: 'ASSIGN_CATEGORY', category: 'disk' })}>
              {bot.disksUsed >= getDiskCapacity(bot) ? 'AT CAPACITY' : 'INSTALL'}
            </Button>
          </div>
        </div>
      </Shell>
    );
  }

  // ===== STATE 2: ITEM PICKER =====
  return (
    <Shell>
      <button onClick={() => dispatch({ type: 'ASSIGN_CATEGORY', category: null as any })} style={backStyle}>← BACK</button>
      <div style={titleStyle}>PICK {ctx.category.toUpperCase()}</div>
      <div style={subStyle}>For {getBotFullName(bot)}</div>

      {ctx.category === 'weapon' && (
        <>
          {Object.entries(state.weaponInv).filter(([, c]) => c > 0).length === 0 ? (
            <div style={emptyStyle}>No weapons in inventory. Buy some at the market.</div>
          ) : Object.entries(state.weaponInv).map(([id, count]) => {
            if (count <= 0) return null;
            const w = WEAPONS[id];
            if (!w) return null;
            const typeOk = !w.type || w.type === botType;
            return (
              <div key={id} style={itemRowStyle}>
                <div style={{ flex: 1 }}>
                  <div style={itemNameStyle}>{w.name} <span style={ownedStyle}>×{count}</span></div>
                  <div style={itemDescStyle}>{w.desc} · +{w.atkBonus} ATK{w.type ? ` · ${TYPE_INFO[w.type].name} only` : ''}</div>
                </div>
                <Button small disabled={!typeOk}
                  onClick={() => {
                    dispatch({ type: 'ASSIGN_EQUIP', botId: bot.id, category: 'weapon', itemId: id });
                    dispatch({ type: 'ASSIGN_CATEGORY', category: null as any });
                  }}>
                  {typeOk ? 'EQUIP' : '—'}
                </Button>
              </div>
            );
          })}
        </>
      )}

      {ctx.category === 'armor' && (
        <>
          {Object.entries(state.armorInv).filter(([, c]) => c > 0).length === 0 ? (
            <div style={emptyStyle}>No armor in inventory.</div>
          ) : Object.entries(state.armorInv).map(([id, count]) => {
            if (count <= 0) return null;
            const a = ARMORS[id];
            if (!a) return null;
            return (
              <div key={id} style={itemRowStyle}>
                <div style={{ flex: 1 }}>
                  <div style={itemNameStyle}>{a.name} <span style={ownedStyle}>×{count}</span></div>
                  <div style={itemDescStyle}>{a.desc} · +{a.defBonus} DEF{a.resist ? ` · resists ${a.resist}` : ''}</div>
                </div>
                <Button small onClick={() => {
                  dispatch({ type: 'ASSIGN_EQUIP', botId: bot.id, category: 'armor', itemId: id });
                  dispatch({ type: 'ASSIGN_CATEGORY', category: null as any });
                }}>
                  EQUIP
                </Button>
              </div>
            );
          })}
        </>
      )}

      {ctx.category === 'disk' && (
        <>
          <div style={hintStyle}>Disks are permanent. You can't remove one once installed.</div>
          {Object.entries(state.diskInv).filter(([, c]) => c > 0).length === 0 ? (
            <div style={emptyStyle}>No disks in inventory.</div>
          ) : Object.entries(state.diskInv).map(([id, count]) => {
            if (count <= 0) return null;
            const d = DISKS[id];
            if (!d) return null;
            const typeOk = d.kind !== 'attack' || !d.requiresType || d.requiresType === botType;
            return (
              <div key={id} style={itemRowStyle}>
                <div style={{ flex: 1 }}>
                  <div style={{ ...itemNameStyle, color: d.kind === 'stat' ? theme.color.info : '#c896ff' }}>
                    {d.name} <span style={ownedStyle}>×{count}</span>
                  </div>
                  <div style={itemDescStyle}>{d.desc}</div>
                </div>
                <Button small disabled={!typeOk}
                  onClick={() => {
                    dispatch({ type: 'ASSIGN_INSTALL_DISK', botId: bot.id, diskId: id });
                    dispatch({ type: 'ASSIGN_CATEGORY', category: null as any });
                  }}>
                  {typeOk ? 'INSTALL' : '—'}
                </Button>
              </div>
            );
          })}
        </>
      )}
    </Shell>
  );
}

const backStyle: CSSProperties = {
  background: 'transparent', border: 'none', color: theme.color.textMuted,
  fontFamily: theme.font.mono, fontSize: theme.size.tiny, letterSpacing: theme.letter.wide,
  cursor: 'pointer', padding: 0, marginBottom: theme.space.md,
};

const titleStyle: CSSProperties = {
  fontFamily: theme.font.display, fontSize: theme.size.h1,
  letterSpacing: theme.letter.wider, color: '#fff',
};

const subStyle: CSSProperties = {
  fontFamily: theme.font.mono, fontSize: theme.size.tiny,
  color: theme.color.textMuted, letterSpacing: theme.letter.wide,
  marginTop: 4, marginBottom: theme.space.lg,
};

const slotStyle: CSSProperties = {
  background: theme.color.bgRaised,
  border: `1px solid ${theme.color.border}`,
  padding: theme.space.md,
  marginBottom: 8,
};

const slotLabelStyle: CSSProperties = {
  fontFamily: theme.font.mono,
  fontSize: theme.size.micro,
  color: theme.color.textDim,
  letterSpacing: theme.letter.wide,
  marginBottom: 4,
};

const slotValueStyle: CSSProperties = {
  fontFamily: theme.font.body,
  fontSize: theme.size.body,
  color: theme.color.text,
  marginBottom: theme.space.sm,
};

const emptySlotStyle: CSSProperties = { color: theme.color.textVeryDim };

const slotBtnRowStyle: CSSProperties = { display: 'flex', gap: 6 };

const itemRowStyle: CSSProperties = {
  background: theme.color.bgRaised,
  border: `1px solid ${theme.color.border}`,
  padding: theme.space.md,
  marginBottom: 6,
  display: 'flex',
  alignItems: 'center',
  gap: theme.space.md,
};

const itemNameStyle: CSSProperties = {
  fontFamily: theme.font.body,
  fontSize: theme.size.body,
  fontWeight: 600,
  color: theme.color.text,
};

const itemDescStyle: CSSProperties = {
  fontSize: 11,
  color: theme.color.textMuted,
  fontStyle: 'italic',
  marginTop: 2,
};

const ownedStyle: CSSProperties = {
  fontFamily: theme.font.mono,
  fontSize: theme.size.tiny,
  color: theme.color.info,
  marginLeft: 4,
};

const emptyStyle: CSSProperties = {
  padding: theme.space.lg,
  textAlign: 'center',
  color: theme.color.textDim,
  fontSize: theme.size.small,
  fontStyle: 'italic',
};

const hintStyle: CSSProperties = {
  fontSize: theme.size.tiny,
  color: theme.color.warning,
  fontStyle: 'italic',
  marginBottom: theme.space.md,
};
