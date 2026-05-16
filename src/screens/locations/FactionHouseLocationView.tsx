import { CSSProperties, useState } from 'react';
import { useGame } from '../../state/GameStore';
import { LOCATIONS } from '../../data/locations';
import { FACTIONS } from '../../data/factions';
import { Button } from '../../components/Button';
import { theme } from '../../styles/theme';
import {
  computeFactionCollection,
  listFactionMechas,
  listFactionWeapons,
} from '../../game/factionCollection';
import { TYPE_INFO } from '../../data/types';
import { RARITY_INFO } from '../../data/models';

export function FactionHouseLocationView({ locationId }: { locationId: string }) {
  const { state, dispatch } = useGame();
  const loc = LOCATIONS[locationId];
  const factionId = loc.factionAlignment;
  if (!factionId) return null;
  const f = FACTIONS[factionId];
  const affiliated = state.factionId === factionId;
  const otherFaction = !!state.factionId && state.factionId !== factionId;

  const [showCollection, setShowCollection] = useState(false);

  // Build the owned weapons set from current inventory + equipped weapons
  const ownedWeaponIds = new Set<string>();
  for (const wId of Object.keys(state.weaponInv)) {
    if (state.weaponInv[wId] > 0) ownedWeaponIds.add(wId);
  }
  for (const b of state.bots) {
    if (b.weapon) ownedWeaponIds.add(b.weapon);
  }

  const stats = computeFactionCollection(factionId, state.discovered, ownedWeaponIds);

  return (
    <div>
      <div style={{ ...mottoStyle, color: theme.factionColor[factionId] }}>"{f.motto}"</div>
      <div style={descStyle}>{f.longDesc}</div>
      <div style={metaStyle}>
        Favored types: {f.preferredTypes.join(', ')} · Temperament: {f.temperament}
      </div>

      {otherFaction && (
        <div style={lockedNoteStyle}>
          You fight for a different faction. You can visit, but cannot enter faction events here.
        </div>
      )}

      {affiliated && (
        <>
          <div style={statusBannerStyle}>
            <span style={statusLabelStyle}>STATUS:</span>{' '}
            <span style={{ color: theme.factionColor[factionId] }}>
              {stats.isPresident ? '★ FACTION PRESIDENT'
                : stats.isLeader ? '✦ FACTION LEADER'
                : 'MEMBER'}
            </span>
          </div>

          <div style={collectionCardStyle}>
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
            <Button variant="ghost" small full
              style={{ marginTop: theme.space.sm }}
              onClick={() => setShowCollection(!showCollection)}>
              {showCollection ? 'HIDE COLLECTION DETAIL ↑' : 'SHOW COLLECTION DETAIL ↓'}
            </Button>
          </div>

          {showCollection && (
            <div style={detailBoxStyle}>
              <div style={subHeaderStyle}>FACTION MECHAS</div>
              {listFactionMechas(factionId, state.discovered).map(({ model, owned, points }) => (
                <div key={model.id} style={{
                  ...itemRowStyle,
                  ...(owned ? {} : itemLockedStyle),
                }}>
                  <span style={itemNameStyle}>
                    {owned ? model.surname : '???'}
                  </span>
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
                <div key={weapon.id} style={{
                  ...itemRowStyle,
                  ...(owned ? {} : itemLockedStyle),
                }}>
                  <span style={itemNameStyle}>{owned ? weapon.name : '???'}</span>
                  <span style={itemTagStyle}>{tier.toUpperCase()}</span>
                  <span style={itemPointsStyle}>{points}pt</span>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {!affiliated && !state.factionId && (
        <Button full variant="secondary"
          onClick={() => dispatch({ type: 'GO_SCENE', scene: 'faction_pick' })}>
          CONSIDER AFFILIATION
        </Button>
      )}
    </div>
  );
}

const mottoStyle: CSSProperties = {
  fontFamily: theme.font.display,
  fontSize: theme.size.h3,
  letterSpacing: theme.letter.wide,
  marginBottom: theme.space.md,
};

const descStyle: CSSProperties = {
  fontSize: theme.size.small,
  color: theme.color.text,
  lineHeight: 1.6,
  marginBottom: theme.space.sm,
};

const metaStyle: CSSProperties = {
  fontFamily: theme.font.mono,
  fontSize: theme.size.tiny,
  color: theme.color.info,
  letterSpacing: theme.letter.tight,
  marginBottom: theme.space.md,
};

const lockedNoteStyle: CSSProperties = {
  fontStyle: 'italic',
  fontSize: theme.size.small,
  color: theme.color.danger,
  padding: theme.space.sm,
  background: theme.color.danger + '10',
  border: `1px solid ${theme.color.danger}40`,
};

const statusBannerStyle: CSSProperties = {
  fontFamily: theme.font.mono,
  fontSize: theme.size.small,
  letterSpacing: theme.letter.wide,
  padding: theme.space.sm,
  background: theme.color.bgRaised,
  border: `1px solid ${theme.color.border}`,
  marginBottom: theme.space.sm,
  textAlign: 'center',
};

const statusLabelStyle: CSSProperties = {
  color: theme.color.textDim,
};

const collectionCardStyle: CSSProperties = {
  padding: theme.space.md,
  background: theme.color.bgRaised,
  border: `1px solid ${theme.color.border}`,
};

const collectionRowStyle: CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  fontFamily: theme.font.mono,
  fontSize: theme.size.tiny,
  marginBottom: 4,
};

const collectionLabelStyle: CSSProperties = {
  color: theme.color.textDim,
  letterSpacing: theme.letter.wide,
};

const collectionValueStyle: CSSProperties = {
  color: theme.color.text,
};

const collectionPointsStyle: CSSProperties = {
  color: theme.color.accent,
  fontWeight: 800,
};

const collectionBarBg: CSSProperties = {
  height: 4,
  background: theme.color.bgSunken,
  marginBottom: theme.space.sm,
};

const collectionBarFill: CSSProperties = {
  height: '100%',
  transition: 'width 0.3s',
};

const detailBoxStyle: CSSProperties = {
  marginTop: theme.space.sm,
  padding: theme.space.md,
  background: theme.color.bgSunken,
  border: `1px solid ${theme.color.border}`,
};

const subHeaderStyle: CSSProperties = {
  fontFamily: theme.font.display,
  fontSize: theme.size.tiny,
  letterSpacing: theme.letter.wide,
  color: theme.color.accent,
  marginBottom: 6,
};

const itemRowStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: '1fr 60px 70px 36px',
  gap: 4,
  alignItems: 'center',
  padding: '4px 0',
  fontFamily: theme.font.mono,
  fontSize: theme.size.tiny,
  borderBottom: `1px solid ${theme.color.border}40`,
};

const itemLockedStyle: CSSProperties = {
  opacity: 0.4,
};

const itemNameStyle: CSSProperties = {
  color: theme.color.text,
  fontFamily: theme.font.display,
};

const itemTagStyle: CSSProperties = {
  fontSize: theme.size.micro,
  letterSpacing: theme.letter.wide,
  textAlign: 'center',
};

const itemRarityStyle: CSSProperties = {
  fontSize: theme.size.micro,
  letterSpacing: theme.letter.wide,
  textAlign: 'center',
};

const itemPointsStyle: CSSProperties = {
  color: theme.color.accent,
  textAlign: 'right',
};
