/**
 * FactionHouseLocationView — the full faction house experience.
 *
 * Four sub-actions, all gated to faction members:
 *   STORE     — exclusive advanced weapons + discount on type-aligned basics
 *   GRIND     — faction-only grind pool (preferred-type mechas at city-tier rarity)
 *   FIGHTS    — challenge coaches (existing 3b collection-fight slots)
 *   PRESIDENT — single boss fight against the faction president (Hollowmere only)
 *
 * Non-members see only collection status + an option to consider affiliation.
 */

import { CSSProperties, useState } from 'react';
import { useGame } from '../../state/GameStore';
import { getPlace } from '../../data/places';
import { FACTIONS } from '../../data/factions';
import { Button } from '../../components/Button';
import { theme } from '../../styles/theme';
import { PaletteOverride, makePaletteFromHex } from '../../styles/cityPalette';
import {
  computeFactionCollection,
  listFactionMechas,
  listFactionWeapons,
} from '../../game/factionCollection';
import { TYPE_INFO } from '../../data/types';
import { MODELS, RARITY_INFO } from '../../data/models';
import { WEAPONS } from '../../data/weapons';
import {
  getFactionGrindPool,
  getFactionStoreInventory,
  factionStorePrice,
  FACTION_EXCLUSIVE_WEAPONS,
} from '../../data/factionHouse';
import { ALL_COACHES } from '../../data/coaches';
import type { PendingBattle } from '../../state/types';

type Sub = 'main' | 'store' | 'grind' | 'fights' | 'president';

export function FactionHouseLocationView({ locationId }: { locationId: string }) {
  const { state, dispatch } = useGame();
  const place = getPlace(locationId);
  if (!place || place.kind !== 'faction_house') return null;

  const f = FACTIONS[place.factionId];
  const affiliated = state.factionId === place.factionId;
  const otherFaction = !!state.factionId && state.factionId !== place.factionId;
  const factionPalette = makePaletteFromHex(theme.factionColor[place.factionId]);

  const [sub, setSub] = useState<Sub>('main');

  if (!affiliated) {
    return (
      <PaletteOverride palette={factionPalette}>
        <NonMemberView placeId={place.id} factionId={place.factionId} otherFaction={otherFaction} />
      </PaletteOverride>
    );
  }

  if (sub === 'store') return <PaletteOverride palette={factionPalette}><StoreSubView factionId={place.factionId} onBack={() => setSub('main')} /></PaletteOverride>;
  if (sub === 'grind') return <PaletteOverride palette={factionPalette}><GrindSubView factionId={place.factionId} cityId={place.cityId} onBack={() => setSub('main')} /></PaletteOverride>;
  if (sub === 'fights') return <PaletteOverride palette={factionPalette}><FightsSubView factionId={place.factionId} onBack={() => setSub('main')} /></PaletteOverride>;
  if (sub === 'president' && place.presidentCoachId) {
    return <PaletteOverride palette={factionPalette}><PresidentSubView factionId={place.factionId} coachId={place.presidentCoachId} onBack={() => setSub('main')} /></PaletteOverride>;
  }

  return (
    <PaletteOverride palette={factionPalette}>
      <div>
      <div style={{ ...mottoStyle, color: theme.factionColor[place.factionId] }}>"{f.motto}"</div>
      <div style={descStyle}>{f.longDesc}</div>
      <div style={metaStyle}>
        Favored types: <strong>{f.preferredTypes.join(', ')}</strong> · Temperament: {f.temperament}
      </div>

      <div style={statusBannerStyle}>
        <span style={statusLabelStyle}>STATUS:</span>{' '}
        <span style={{ color: theme.factionColor[place.factionId] }}>
          {state.storyFlags.has('inter_faction_won') ? '★ INTER-FACTION CHAMPION'
            : state.storyFlags.has('faction_president') ? '★ FACTION PRESIDENT'
            : 'MEMBER'}
        </span>
      </div>

      {/* Four sub-action buttons */}
      <div style={subActionsStyle}>
        <Button full small variant="secondary" onClick={() => setSub('store')}>
          STORE — Exclusive weapons →
        </Button>
        <Button full small variant="secondary" onClick={() => setSub('grind')}>
          GRIND — Faction wild pool →
        </Button>
        <Button full small variant="secondary" onClick={() => setSub('fights')}>
          FIGHTS — Faction challengers →
        </Button>
        {place.presidentCoachId && (
          <Button full small
            style={state.storyFlags.has('faction_president')
              ? { opacity: 0.5 } : { background: theme.factionColor[place.factionId] }}
            onClick={() => setSub('president')}>
            {state.storyFlags.has('faction_president') ? '★ PRESIDENT (defeated)'
              : 'CHALLENGE PRESIDENT →'}
          </Button>
        )}
      </div>

      <CollectionPanel factionId={place.factionId} />
    </div>
    </PaletteOverride>
  );
}

// ============================================================
// Non-member: collection-status-only (legacy 3b view)
// ============================================================
function NonMemberView({ placeId, factionId, otherFaction }: { placeId: string; factionId: 'naturesOwn' | 'elementalists' | 'industrials'; otherFaction: boolean }) {
  const { state, dispatch } = useGame();
  const f = FACTIONS[factionId];

  return (
    <div>
      <div style={{ ...mottoStyle, color: theme.factionColor[factionId] }}>"{f.motto}"</div>
      <div style={descStyle}>{f.longDesc}</div>
      <div style={metaStyle}>
        Favored types: <strong>{f.preferredTypes.join(', ')}</strong> · Temperament: {f.temperament}
      </div>

      {otherFaction && (
        <div style={lockedNoteStyle}>
          You fight for a different faction. You can visit, but cannot enter the store, grind area, or challenge ladder here.
        </div>
      )}

      {!state.factionId && (
        <Button full variant="secondary"
          onClick={() => dispatch({ type: 'GO_SCENE', scene: 'faction_pick' })}>
          CONSIDER AFFILIATION
        </Button>
      )}
    </div>
  );
}

// ============================================================
// Collection panel (kept from 3b)
// ============================================================
function CollectionPanel({ factionId }: { factionId: 'naturesOwn' | 'elementalists' | 'industrials' }) {
  const { state } = useGame();
  const [showCollection, setShowCollection] = useState(false);

  const ownedWeaponIds = new Set<string>();
  for (const wId of Object.keys(state.weaponInv)) {
    if (state.weaponInv[wId] > 0) ownedWeaponIds.add(wId);
  }
  for (const b of state.bots) {
    if (b.weapon) ownedWeaponIds.add(b.weapon);
  }

  const stats = computeFactionCollection(factionId, state.discovered, ownedWeaponIds);

  return (
    <div style={collectionCardStyle}>
      <div style={collectionHeaderStyle}>COLLECTION PROGRESS</div>
      <div style={collectionRowStyle}>
        <span style={collectionLabelStyle}>MECHAS</span>
        <span style={collectionValueStyle}>{stats.mechaOwned}/{stats.mechaTotal}</span>
        <span style={collectionPointsStyle}>{stats.mechaPoints}/{stats.mechaMaxPoints} pts</span>
      </div>
      <div style={collectionBarBg}>
        <div style={{
          ...collectionBarFill,
          background: theme.factionColor[factionId],
          width: stats.mechaMaxPoints > 0 ? `${(stats.mechaPoints / stats.mechaMaxPoints) * 100}%` : '0%',
        }} />
      </div>
      <div style={collectionRowStyle}>
        <span style={collectionLabelStyle}>WEAPONS</span>
        <span style={collectionValueStyle}>{stats.weaponOwned}/{stats.weaponTotal}</span>
        <span style={collectionPointsStyle}>{stats.weaponPoints}/{stats.weaponMaxPoints} pts</span>
      </div>
      <div style={collectionBarBg}>
        <div style={{
          ...collectionBarFill,
          background: theme.factionColor[factionId],
          width: stats.weaponMaxPoints > 0 ? `${(stats.weaponPoints / stats.weaponMaxPoints) * 100}%` : '0%',
        }} />
      </div>
      <Button variant="ghost" small full style={{ marginTop: theme.space.sm }}
        onClick={() => setShowCollection(!showCollection)}>
        {showCollection ? 'HIDE COLLECTION ↑' : 'SHOW COLLECTION ↓'}
      </Button>
      {showCollection && (
        <div style={detailBoxStyle}>
          <div style={subHeaderStyle}>FACTION MECHAS</div>
          {listFactionMechas(factionId, state.discovered).map(({ model, owned, points }) => (
            <div key={model.id} style={{ ...itemRowStyle, ...(owned ? {} : itemLockedStyle) }}>
              <span style={itemNameStyle}>{owned ? model.surname : '???'}</span>
              <span style={{ ...itemTagStyle, color: theme.typeColor[model.type] }}>
                {TYPE_INFO[model.type].name}
              </span>
              <span style={{ ...itemRarityStyle, color: RARITY_INFO[model.rarity].color }}>
                {RARITY_INFO[model.rarity].name}
              </span>
              <span style={itemPointsStyle}>{points}pt</span>
            </div>
          ))}
          <div style={{ ...subHeaderStyle, marginTop: theme.space.md }}>FACTION WEAPONS</div>
          {listFactionWeapons(factionId, ownedWeaponIds).map(({ weapon, owned, points, tier }) => (
            <div key={weapon.id} style={{ ...itemRowStyle, ...(owned ? {} : itemLockedStyle) }}>
              <span style={itemNameStyle}>{owned ? weapon.name : '???'}</span>
              <span style={itemTagStyle}>{tier.toUpperCase()}</span>
              <span style={itemPointsStyle}>{points}pt</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ============================================================
// STORE
// ============================================================
function StoreSubView({ factionId, onBack }: { factionId: 'naturesOwn' | 'elementalists' | 'industrials'; onBack: () => void }) {
  const { state, dispatch } = useGame();
  const inventory = getFactionStoreInventory(factionId);
  const exclusiveSet = new Set(FACTION_EXCLUSIVE_WEAPONS[factionId]);

  const buy = (wId: string) => {
    const price = factionStorePrice(wId);
    if (state.money < price) return;
    dispatch({ type: 'BUY_WEAPON', weaponId: wId, price });
  };

  return (
    <div>
      <button onClick={onBack} style={backStyle}>← FACTION HOUSE</button>
      <div style={subTitleStyle}>FACTION STORE</div>
      <div style={subHintStyle}>15% member discount on faction-type weapons. Exclusive advanced weapons available only here.</div>

      <div style={{ marginTop: theme.space.md }}>
        {inventory.map(wId => {
          const w = WEAPONS[wId];
          if (!w) return null;
          const price = factionStorePrice(wId);
          const canAfford = state.money >= price;
          const isExclusive = exclusiveSet.has(wId);
          return (
            <button key={wId} disabled={!canAfford}
              onClick={() => buy(wId)}
              style={{ ...storeRowStyle, ...(!canAfford ? lockedStyle : {}) }}>
              <div style={storeNameStyle}>
                {w.name}
                {isExclusive && <span style={exclusiveBadgeStyle}>EXCLUSIVE</span>}
              </div>
              <div style={storeStatsStyle}>
                {w.type && <span style={{ color: theme.typeColor[w.type] }}>{TYPE_INFO[w.type].name}</span>}
                {' · '}+{w.atkBonus} ATK
              </div>
              <div style={storePriceStyle}>{price.toLocaleString()} cr</div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ============================================================
// GRIND
// ============================================================
function GrindSubView({ factionId, cityId, onBack }: { factionId: 'naturesOwn' | 'elementalists' | 'industrials'; cityId: string; onBack: () => void }) {
  const { state, dispatch } = useGame();
  const pool = getFactionGrindPool(factionId, cityId);

  if (pool.length === 0) {
    return (
      <div>
        <button onClick={onBack} style={backStyle}>← FACTION HOUSE</button>
        <div style={subTitleStyle}>FACTION GRIND</div>
        <div style={subHintStyle}>No grind area available at this faction house yet.</div>
      </div>
    );
  }

  const fight = () => {
    const totalWeight = pool.reduce((s, p) => s + (p.weight ?? 1), 0);
    let r = Math.random() * totalWeight;
    let pick = pool[0];
    for (const entry of pool) {
      r -= (entry.weight ?? 1);
      if (r <= 0) { pick = entry; break; }
    }
    const lvl = Math.floor(pick.minLevel + Math.random() * (pick.maxLevel - pick.minLevel + 1));
    const battle: PendingBattle = {
      source: 'junkyard',
      sourceId: `faction_${factionId}_grind`,
      oppLevel: lvl,
      oppRank: 'rookie',
      teamSize: 1,
      forceModelId: pick.modelId,
      wildModelId: pick.modelId,
      isWild: true,
      prize: 60,
      xpReward: 60,  // bonus XP per request
    };
    dispatch({ type: 'QUEUE_BATTLE', battle });
  };

  return (
    <div>
      <button onClick={onBack} style={backStyle}>← FACTION HOUSE</button>
      <div style={subTitleStyle}>FACTION GRIND</div>
      <div style={subHintStyle}>
        Only mechas of your faction's preferred types appear here. Bonus XP. Win to KEEP or SALVAGE.
      </div>

      <div style={{ marginTop: theme.space.md }}>
        {pool.map((entry, i) => {
          const m = MODELS[entry.modelId];
          if (!m) return null;
          const tColor = theme.typeColor[m.type];
          const owned = state.discovered.has(m.id);
          return (
            <div key={i} style={poolRowStyle}>
              <div style={{ ...poolDotStyle, background: tColor }} />
              <div style={poolNameStyle}>
                {m.surname}
                <span style={poolTypeStyle}> · {TYPE_INFO[m.type].name} · </span>
                <span style={{ color: RARITY_INFO[m.rarity].color }}>{RARITY_INFO[m.rarity].name}</span>
              </div>
              <div style={poolMetaStyle}>
                LV {entry.minLevel}–{entry.maxLevel}
                {owned && <span style={ownedBadgeStyle}> ✓</span>}
              </div>
            </div>
          );
        })}
      </div>

      <Button full style={{ marginTop: theme.space.md }} disabled={state.bots.length === 0}
        onClick={fight}>
        ENGAGE A WILD MECHA →
      </Button>
    </div>
  );
}

// ============================================================
// FIGHTS (faction-only challengers)
// ============================================================
function FightsSubView({ factionId, onBack }: { factionId: 'naturesOwn' | 'elementalists' | 'industrials'; onBack: () => void }) {
  const { state, dispatch } = useGame();

  // Filter all faction-coaches (id prefix 'fc_') matching this faction.
  // For now, none are seeded; this view shows an empty state with hint.
  const factionCoaches = Object.values(ALL_COACHES).filter(c =>
    c.id.startsWith(`fc_${factionId}`)
  );

  return (
    <div>
      <button onClick={onBack} style={backStyle}>← FACTION HOUSE</button>
      <div style={subTitleStyle}>FACTION CHALLENGERS</div>
      <div style={subHintStyle}>
        Practice fights against faction members. Awards XP and credits.
      </div>

      {factionCoaches.length === 0 ? (
        <div style={emptyStyle}>
          No faction-coach challenges seeded for this iteration. Coming soon.
        </div>
      ) : (
        <div style={{ marginTop: theme.space.md }}>
          {factionCoaches.map(c => (
            <button key={c.id} disabled={state.bots.length === 0}
              onClick={() => {
                const battle: PendingBattle = {
                  source: 'trainer',
                  sourceId: c.id,
                  trainerId: c.id,
                  oppLevel: c.team[0]?.level ?? 1,
                  oppRank: 'rookie',
                  teamSize: c.team.length,
                  prize: 200,
                  xpReward: 80,
                };
                dispatch({ type: 'QUEUE_BATTLE', battle });
              }}
              style={fightRowStyle}>
              <div style={fightNameStyle}>{c.firstName} {c.surname}</div>
              <div style={fightFlavorStyle}>{c.flavor}</div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ============================================================
// PRESIDENT
// ============================================================
function PresidentSubView({ factionId, coachId, onBack }: { factionId: 'naturesOwn' | 'elementalists' | 'industrials'; coachId: string; onBack: () => void }) {
  const { state, dispatch } = useGame();
  const coach = ALL_COACHES[coachId];
  const alreadyPresident = state.storyFlags.has('faction_president');

  if (!coach) return null;

  const challenge = () => {
    const battle: PendingBattle = {
      source: 'event',
      sourceId: coachId,
      trainerId: coachId,
      oppLevel: coach.team[0]?.level ?? 28,
      oppRank: 'elite',
      teamSize: coach.team.length,
      prize: 10000,
      xpReward: 600,
      fameReward: 1000,
      onWinFlags: ['faction_president'],
    };
    dispatch({ type: 'QUEUE_BATTLE', battle });
  };

  return (
    <div>
      <button onClick={onBack} style={backStyle}>← FACTION HOUSE</button>
      <div style={subTitleStyle}>FACTION PRESIDENT</div>

      <div style={presBoxStyle}>
        <div style={presNameStyle}>{coach.firstName} {coach.surname}</div>
        <div style={presSubStyle}>Current President · ELITE TIER</div>
        <div style={presFlavorStyle}>{coach.flavor}</div>
        <div style={presTeamStyle}>
          Team: {coach.team.map(s => `${MODELS[s.modelId]?.surname ?? '?'} LV${s.level}`).join(' · ')}
        </div>
        <div style={presRewardStyle}>
          Reward: 10,000 cr · 1,000 fame · become Faction President
        </div>
      </div>

      {alreadyPresident ? (
        <div style={lockedNoteStyle}>
          You are already Faction President. The Inter-Faction Championship awaits at the Officials' Hall.
        </div>
      ) : (
        <Button full disabled={state.bots.length === 0} onClick={challenge}
          style={{ marginTop: theme.space.md, background: theme.factionColor[factionId] }}>
          ★ CHALLENGE THE PRESIDENT →
        </Button>
      )}
    </div>
  );
}

// ============================================================
// STYLES
// ============================================================

const mottoStyle: CSSProperties = {
  fontFamily: theme.font.display, fontSize: theme.size.h3,
  letterSpacing: theme.letter.wide, marginBottom: theme.space.md,
};
const descStyle: CSSProperties = {
  fontSize: theme.size.small, color: theme.color.text, lineHeight: 1.6,
  marginBottom: theme.space.sm,
};
const metaStyle: CSSProperties = {
  fontFamily: theme.font.mono, fontSize: theme.size.tiny,
  color: theme.color.info, letterSpacing: theme.letter.tight, marginBottom: theme.space.md,
};
const lockedNoteStyle: CSSProperties = {
  fontStyle: 'italic', fontSize: theme.size.small, color: theme.color.danger,
  padding: theme.space.sm, background: theme.color.danger + '10',
  border: `1px solid ${theme.color.danger}40`, marginTop: theme.space.md,
};
const statusBannerStyle: CSSProperties = {
  fontFamily: theme.font.mono, fontSize: theme.size.small, letterSpacing: theme.letter.wide,
  padding: theme.space.sm, background: theme.color.bgRaised,
  border: `1px solid ${theme.color.border}`,
  marginBottom: theme.space.md, textAlign: 'center',
};
const statusLabelStyle: CSSProperties = { color: theme.color.textDim };

const subActionsStyle: CSSProperties = {
  display: 'flex', flexDirection: 'column', gap: 6, marginBottom: theme.space.lg,
};
const backStyle: CSSProperties = {
  background: 'transparent', border: 'none', color: theme.color.textMuted,
  fontFamily: theme.font.mono, fontSize: theme.size.tiny, letterSpacing: theme.letter.wide,
  cursor: 'pointer', padding: 0, marginBottom: theme.space.md,
};
const subTitleStyle: CSSProperties = {
  fontFamily: theme.font.display, fontSize: theme.size.h2,
  letterSpacing: theme.letter.wider, color: '#fff', marginBottom: 4,
};
const subHintStyle: CSSProperties = {
  fontSize: theme.size.tiny, color: theme.color.textMuted,
  lineHeight: 1.5, marginBottom: theme.space.md,
};
const lockedStyle: CSSProperties = { opacity: 0.45, cursor: 'not-allowed' };

const storeRowStyle: CSSProperties = {
  display: 'grid', gridTemplateColumns: '1fr auto', gap: 8, alignItems: 'center',
  padding: '10px 12px', marginBottom: 4,
  background: theme.color.bgRaised, border: `1px solid ${theme.color.border}`,
  textAlign: 'left', color: theme.color.text, font: 'inherit', cursor: 'pointer',
  width: '100%',
};
const storeNameStyle: CSSProperties = {
  fontFamily: theme.font.display, fontSize: theme.size.body, color: '#fff',
  display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap',
};
const exclusiveBadgeStyle: CSSProperties = {
  fontFamily: theme.font.mono, fontSize: theme.size.micro,
  letterSpacing: theme.letter.wide, padding: '1px 5px',
  border: `1px solid ${theme.color.gold}`, color: theme.color.gold,
  borderRadius: 2,
};
const storeStatsStyle: CSSProperties = {
  fontFamily: theme.font.mono, fontSize: theme.size.tiny, color: theme.color.textMuted,
  gridColumn: '1 / 2',
};
const storePriceStyle: CSSProperties = {
  fontFamily: theme.font.display, fontSize: theme.size.small,
  color: theme.color.accent, gridRow: '1 / 3', gridColumn: '2', alignSelf: 'center',
};

const poolRowStyle: CSSProperties = {
  display: 'grid', gridTemplateColumns: '12px 1fr auto', gap: 8, alignItems: 'center',
  padding: '6px 10px', fontFamily: theme.font.mono, fontSize: theme.size.tiny,
  background: theme.color.bgRaised,
  borderBottom: `1px solid ${theme.color.border}40`,
};
const poolDotStyle: CSSProperties = { width: 8, height: 8, borderRadius: 4 };
const poolNameStyle: CSSProperties = { color: theme.color.text };
const poolTypeStyle: CSSProperties = { color: theme.color.textDim };
const poolMetaStyle: CSSProperties = { color: theme.color.textMuted, textAlign: 'right' };
const ownedBadgeStyle: CSSProperties = { color: theme.color.success, marginLeft: 4, fontWeight: 800 };

const fightRowStyle: CSSProperties = {
  display: 'block', width: '100%', textAlign: 'left',
  padding: '10px 12px', marginBottom: 4,
  background: theme.color.bgRaised, border: `1px solid ${theme.color.border}`,
  color: theme.color.text, font: 'inherit', cursor: 'pointer',
};
const fightNameStyle: CSSProperties = {
  fontFamily: theme.font.display, fontSize: theme.size.body, color: '#fff',
};
const fightFlavorStyle: CSSProperties = {
  fontFamily: theme.font.body, fontStyle: 'italic',
  fontSize: theme.size.tiny, color: theme.color.textDim, marginTop: 2,
};
const emptyStyle: CSSProperties = {
  textAlign: 'center', padding: theme.space.lg, color: theme.color.textDim,
  fontStyle: 'italic', fontSize: theme.size.tiny,
};

const presBoxStyle: CSSProperties = {
  padding: theme.space.md, background: theme.color.bgRaised,
  border: `2px solid ${theme.color.gold}`, marginBottom: theme.space.md,
};
const presNameStyle: CSSProperties = {
  fontFamily: theme.font.display, fontSize: theme.size.h2,
  letterSpacing: theme.letter.wider, color: '#fff',
};
const presSubStyle: CSSProperties = {
  fontFamily: theme.font.mono, fontSize: theme.size.tiny,
  color: theme.color.gold, letterSpacing: theme.letter.wide, marginBottom: theme.space.sm,
};
const presFlavorStyle: CSSProperties = {
  fontFamily: theme.font.body, fontStyle: 'italic',
  fontSize: theme.size.small, color: theme.color.textDim,
  marginBottom: theme.space.sm, lineHeight: 1.5,
};
const presTeamStyle: CSSProperties = {
  fontFamily: theme.font.mono, fontSize: theme.size.tiny,
  color: theme.color.text, marginBottom: theme.space.sm,
};
const presRewardStyle: CSSProperties = {
  fontFamily: theme.font.mono, fontSize: theme.size.tiny,
  color: theme.color.accent,
};

const collectionCardStyle: CSSProperties = {
  padding: theme.space.md, background: theme.color.bgRaised,
  border: `1px solid ${theme.color.border}`,
};
const collectionHeaderStyle: CSSProperties = {
  fontFamily: theme.font.display, fontSize: theme.size.tiny,
  letterSpacing: theme.letter.wide, color: theme.color.accent,
  marginBottom: theme.space.sm, textAlign: 'center',
};
const collectionRowStyle: CSSProperties = {
  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
  fontFamily: theme.font.mono, fontSize: theme.size.tiny, marginBottom: 4,
};
const collectionLabelStyle: CSSProperties = {
  color: theme.color.textDim, letterSpacing: theme.letter.wide,
};
const collectionValueStyle: CSSProperties = { color: theme.color.text };
const collectionPointsStyle: CSSProperties = { color: theme.color.accent, fontWeight: 800 };
const collectionBarBg: CSSProperties = {
  height: 4, background: theme.color.bgSunken, marginBottom: theme.space.sm,
};
const collectionBarFill: CSSProperties = { height: '100%', transition: 'width 0.3s' };
const detailBoxStyle: CSSProperties = {
  marginTop: theme.space.sm, padding: theme.space.md,
  background: theme.color.bgSunken, border: `1px solid ${theme.color.border}`,
};
const subHeaderStyle: CSSProperties = {
  fontFamily: theme.font.display, fontSize: theme.size.tiny,
  letterSpacing: theme.letter.wide, color: theme.color.accent, marginBottom: 6,
};
const itemRowStyle: CSSProperties = {
  display: 'grid', gridTemplateColumns: '1fr 60px 70px 36px',
  gap: 4, alignItems: 'center', padding: '4px 0',
  fontFamily: theme.font.mono, fontSize: theme.size.tiny,
  borderBottom: `1px solid ${theme.color.border}40`,
};
const itemLockedStyle: CSSProperties = { opacity: 0.4 };
const itemNameStyle: CSSProperties = { color: theme.color.text, fontFamily: theme.font.display };
const itemTagStyle: CSSProperties = {
  fontSize: theme.size.micro, letterSpacing: theme.letter.wide, textAlign: 'center',
};
const itemRarityStyle: CSSProperties = {
  fontSize: theme.size.micro, letterSpacing: theme.letter.wide, textAlign: 'center',
};
const itemPointsStyle: CSSProperties = { color: theme.color.accent, textAlign: 'right' };
