import { CSSProperties, useState } from 'react';
import { useGame } from '../../state/GameStore';
import { WEAPONS } from '../../data/weapons';
import { ARMORS } from '../../data/armors';
import { DISKS } from '../../data/disks';
import { ITEMS } from '../../data/items';
import { MATERIALS } from '../../data/materials';
import { MODELS } from '../../data/models';
import { TYPE_INFO } from '../../data/types';
import { theme } from '../../styles/theme';
import { Button } from '../../components/Button';
import { SubHeader } from '../../components/SectionHeader';

type Tab = 'sell' | 'weapons' | 'armor' | 'disks' | 'items' | 'chassis';

export function MarketLocationView({ locationId }: { locationId: string }) {
  const { state, dispatch } = useGame();
  const isVoltspire = locationId === 'volt_market';
  const [tab, setTab] = useState<Tab>('sell');

  return (
    <div>
      <div style={tabsStyle}>
        {([
          { id: 'sell', label: 'SELL' },
          { id: 'weapons', label: 'WEAPONS' },
          { id: 'armor', label: 'ARMOR' },
          { id: 'disks', label: 'DISKS' },
          { id: 'items', label: 'ITEMS' },
          { id: 'chassis', label: 'CHASSIS' },
        ] as { id: Tab; label: string }[]).map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            style={{ ...tabStyle, ...(tab === t.id ? activeTabStyle : {}) }}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'sell' && (
        <>
          <SubHeader>SELL MATERIALS</SubHeader>
          <div style={hintStyle}>Trade junkyard salvage for credits.</div>
          {Object.entries(state.materials).length === 0 ? (
            <div style={emptyStyle}>No materials. Try the Junkyard.</div>
          ) : (
            Object.entries(state.materials).map(([id, count]) => {
              if (!count) return null;
              const m = MATERIALS[id];
              if (!m) return null;
              return (
                <div key={id} style={rowStyle}>
                  <div style={mainStyle}>
                    <div style={nameStyle}>{m.name} ×{count}</div>
                    <div style={descStyle}>{m.desc} · {m.sellPrice} CR each</div>
                  </div>
                  <div style={{ display: 'flex', gap: 4 }}>
                    <Button small variant="ghost" onClick={() => dispatch({ type: 'SELL_MATERIAL', materialId: id, count: 1 })}>+1</Button>
                    <Button small onClick={() => dispatch({ type: 'SELL_MATERIAL', materialId: id, count })}>ALL</Button>
                  </div>
                </div>
              );
            })
          )}
        </>
      )}

      {tab === 'weapons' && (
        <>
          <SubHeader>WEAPONS</SubHeader>
          <div style={hintStyle}>Each weapon grants ATK and unlocks a signature attack (2× per battle, after round 3).</div>
          {Object.values(WEAPONS).filter(w => isVoltspire || w.price <= 1500).map(w => {
            const t = w.type ? TYPE_INFO[w.type] : null;
            return (
              <div key={w.id} style={rowStyle}>
                <div style={mainStyle}>
                  <div style={nameStyle}>{w.name}{t && <span style={{ ...chipStyle, color: theme.typeColor[w.type!], borderColor: theme.typeColor[w.type!] }}>{t.name}</span>}{state.weaponInv[w.id] ? <span style={ownedStyle}>×{state.weaponInv[w.id]}</span> : null}</div>
                  <div style={descStyle}>{w.desc} · +{w.atkBonus} ATK</div>
                </div>
                <Button small disabled={state.money < w.price} onClick={() => dispatch({ type: 'BUY_WEAPON', weaponId: w.id })}>{w.price}</Button>
              </div>
            );
          })}
        </>
      )}

      {tab === 'armor' && (
        <>
          <SubHeader>ARMOR</SubHeader>
          {Object.values(ARMORS).filter(a => isVoltspire || a.price <= 1500).map(a => (
            <div key={a.id} style={rowStyle}>
              <div style={mainStyle}>
                <div style={nameStyle}>{a.name}{state.armorInv[a.id] ? <span style={ownedStyle}>×{state.armorInv[a.id]}</span> : null}</div>
                <div style={descStyle}>{a.desc}</div>
              </div>
              <Button small disabled={state.money < a.price} onClick={() => dispatch({ type: 'BUY_ARMOR', armorId: a.id })}>{a.price}</Button>
            </div>
          ))}
        </>
      )}

      {tab === 'disks' && (
        <>
          <SubHeader>DISKS</SubHeader>
          <div style={hintStyle}>Stat disks raise stats. Attack disks teach moves. 1 slot each. Capacity = bot level × 3.</div>
          {Object.values(DISKS).filter(d => isVoltspire || d.price <= 700).map(d => (
            <div key={d.id} style={rowStyle}>
              <div style={mainStyle}>
                <div style={{ ...nameStyle, color: d.kind === 'stat' ? theme.color.info : '#c896ff' }}>
                  {d.name}{state.diskInv[d.id] ? <span style={ownedStyle}>×{state.diskInv[d.id]}</span> : null}
                </div>
                <div style={descStyle}>{d.desc}</div>
              </div>
              <Button small disabled={state.money < d.price} onClick={() => dispatch({ type: 'BUY_DISK', diskId: d.id })}>{d.price}</Button>
            </div>
          ))}
        </>
      )}

      {tab === 'items' && (
        <>
          <SubHeader>CONSUMABLES</SubHeader>
          {Object.values(ITEMS).map(it => (
            <div key={it.id} style={rowStyle}>
              <div style={mainStyle}>
                <div style={nameStyle}>{it.name}{state.items[it.id] ? <span style={ownedStyle}>×{state.items[it.id]}</span> : null}</div>
                <div style={descStyle}>{it.desc}</div>
              </div>
              <Button small disabled={state.money < it.price} onClick={() => dispatch({ type: 'BUY_ITEM', itemId: it.id })}>{it.price}</Button>
            </div>
          ))}
        </>
      )}

      {tab === 'chassis' && (
        <>
          <SubHeader>CHASSIS CONTRACTS</SubHeader>
          {isVoltspire ? (
            Object.values(MODELS).filter(m => m.price && !state.bots.some(b => b.modelId === m.id)).map(m => (
              <div key={m.id} style={rowStyle}>
                <div style={mainStyle}>
                  <div style={nameStyle}>{m.surname}<span style={{ ...chipStyle, color: theme.typeColor[m.type], borderColor: theme.typeColor[m.type] }}>{TYPE_INFO[m.type].name}</span></div>
                  <div style={descStyle}>{m.flavor}</div>
                </div>
                <Button small disabled={state.money < (m.price ?? 0) || state.bots.length >= 5} onClick={() => dispatch({ type: 'BUY_MODEL', modelId: m.id })}>{m.price}</Button>
              </div>
            ))
          ) : (
            <div style={emptyStyle}>Ironhaven doesn't stock chassis. Try Voltspire.</div>
          )}
        </>
      )}
    </div>
  );
}

const tabsStyle: CSSProperties = { display: 'flex', gap: 4, marginBottom: theme.space.md };

const tabStyle: CSSProperties = {
  flex: 1,
  padding: '6px 2px',
  background: 'transparent',
  color: theme.color.textDim,
  fontFamily: theme.font.display,
  fontSize: 10,
  letterSpacing: theme.letter.wide,
  cursor: 'pointer',
  border: 'none',
};

const activeTabStyle: CSSProperties = {
  background: theme.color.panel,
  color: theme.color.accent,
  borderBottom: `2px solid ${theme.color.accent}`,
};

const hintStyle: CSSProperties = {
  fontSize: theme.size.small,
  color: theme.color.textMuted,
  fontStyle: 'italic',
  marginBottom: theme.space.md,
  lineHeight: 1.5,
};

const rowStyle: CSSProperties = {
  background: theme.color.bgRaised,
  border: `1px solid ${theme.color.border}`,
  padding: theme.space.md,
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  gap: theme.space.md,
  marginBottom: 6,
};

const mainStyle: CSSProperties = { flex: 1 };

const nameStyle: CSSProperties = {
  fontSize: theme.size.body,
  fontWeight: 600,
  display: 'flex',
  alignItems: 'center',
  gap: 6,
  flexWrap: 'wrap',
  color: theme.color.text,
};

const descStyle: CSSProperties = {
  fontSize: 11,
  color: theme.color.textMuted,
  marginTop: 2,
  fontStyle: 'italic',
};

const ownedStyle: CSSProperties = {
  fontFamily: theme.font.mono,
  fontSize: theme.size.tiny,
  color: theme.color.info,
  marginLeft: 4,
};

const chipStyle: CSSProperties = {
  fontFamily: theme.font.mono,
  fontSize: theme.size.micro,
  letterSpacing: theme.letter.normal,
  padding: '2px 6px',
  border: '1px solid',
  borderRadius: 2,
};

const emptyStyle: CSSProperties = {
  padding: theme.space.md,
  textAlign: 'center',
  color: theme.color.textDim,
  fontSize: theme.size.small,
  fontStyle: 'italic',
};
