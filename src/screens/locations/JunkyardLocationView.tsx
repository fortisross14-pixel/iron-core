/**
 * JunkyardLocationView — generic grind-place screen.
 *
 * (Despite the legacy filename, this handles all grind_place kinds. The
 *  routing is keyed on Place.kind === 'grind_place' so this view applies
 *  wherever grind places live, in any region.)
 *
 * Reads the place's spawnPool to:
 *   - show the types/models the player might encounter here
 *   - pick a random spawn for each ENGAGE click
 *
 * Each engagement queues a PendingBattle tagged with isWild + wildModelId
 * so the post-fight flow can offer to KEEP or SALVAGE the mecha.
 */

import { CSSProperties } from 'react';
import { useGame } from '../../state/GameStore';
import { Button } from '../../components/Button';
import { theme } from '../../styles/theme';
import { getPlace } from '../../data/places';
import { MODELS } from '../../data/models';
import { TYPE_INFO } from '../../data/types';
import type { PendingBattle } from '../../state/types';

export function JunkyardLocationView({ locationId }: { locationId: string }) {
  const { state, dispatch } = useGame();
  const place = getPlace(locationId);
  const hasBot = state.bots.length > 0;

  if (!place || place.kind !== 'grind_place') {
    return <div style={hintStyle}>This place isn't configured for grinding.</div>;
  }

  const pickSpawn = () => {
    // Weighted random pick from spawnPool
    const pool = place.spawnPool;
    if (pool.length === 0) return null;
    const totalWeight = pool.reduce((s, p) => s + (p.weight ?? 1), 0);
    let r = Math.random() * totalWeight;
    for (const entry of pool) {
      r -= (entry.weight ?? 1);
      if (r <= 0) {
        const lvl = Math.floor(entry.minLevel + Math.random() * (entry.maxLevel - entry.minLevel + 1));
        return { modelId: entry.modelId, level: lvl };
      }
    }
    const last = pool[pool.length - 1];
    return { modelId: last.modelId, level: last.minLevel };
  };

  const fight = () => {
    const spawn = pickSpawn();
    if (!spawn) return;
    const battle: PendingBattle = {
      source: 'junkyard',
      sourceId: place.id,
      oppLevel: spawn.level,
      oppRank: 'rookie',
      teamSize: 2,         // Player can bring up to 2 mechas (XP will split)
      oppTeamSize: 1,      // Always 1 wild mecha
      forceModelId: spawn.modelId,
      wildModelId: spawn.modelId,
      isWild: true,
      prize: 30,
      xpReward: 35,
    };
    dispatch({ type: 'QUEUE_BATTLE', battle });
  };

  return (
    <div>
      <div style={hintStyle}>{place.desc}</div>

      <div style={poolHeaderStyle}>WILD MECHAS HERE</div>
      <div style={poolListStyle}>
        {place.spawnPool.map((entry, i) => {
          const m = MODELS[entry.modelId];
          if (!m) return null;
          const tColor = theme.typeColor[m.type];
          const owned = state.discovered.has(m.id);
          return (
            <div key={i} style={poolRowStyle}>
              <div style={{ ...poolDotStyle, background: tColor }} />
              <div style={poolNameStyle}>
                {m.surname}
                <span style={poolTypeStyle}> · {TYPE_INFO[m.type].name}</span>
              </div>
              <div style={poolMetaStyle}>
                LV {entry.minLevel}–{entry.maxLevel}
                {owned && <span style={ownedBadgeStyle}> ✓ OWNED</span>}
              </div>
            </div>
          );
        })}
      </div>

      <div style={statsStyle}>
        Wins here: <strong>{state.achievements.junkyardWins}</strong>
      </div>
      <Button full disabled={!hasBot} onClick={fight}>
        ENGAGE A WILD MECHA →
      </Button>
      <div style={smallHint}>
        Defeat wilds to gain XP and materials. After each win you can KEEP the mecha (one per model) or SALVAGE it for parts.
      </div>
    </div>
  );
}

const hintStyle: CSSProperties = {
  fontSize: theme.size.small,
  color: theme.color.text,
  lineHeight: 1.6,
  marginBottom: theme.space.md,
};

const poolHeaderStyle: CSSProperties = {
  fontFamily: theme.font.display,
  fontSize: theme.size.tiny,
  letterSpacing: theme.letter.wide,
  color: theme.color.accent,
  marginBottom: 6,
};

const poolListStyle: CSSProperties = {
  marginBottom: theme.space.md,
  background: theme.color.bgRaised,
  border: `1px solid ${theme.color.border}`,
};

const poolRowStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: '12px 1fr auto',
  gap: 8,
  alignItems: 'center',
  padding: '6px 10px',
  fontFamily: theme.font.mono,
  fontSize: theme.size.tiny,
  borderBottom: `1px solid ${theme.color.border}40`,
};

const poolDotStyle: CSSProperties = {
  width: 8, height: 8, borderRadius: 4,
};

const poolNameStyle: CSSProperties = {
  color: theme.color.text,
};

const poolTypeStyle: CSSProperties = {
  color: theme.color.textDim,
};

const poolMetaStyle: CSSProperties = {
  color: theme.color.textMuted,
  textAlign: 'right',
};

const ownedBadgeStyle: CSSProperties = {
  color: theme.color.success,
  marginLeft: 4,
  fontWeight: 800,
};

const statsStyle: CSSProperties = {
  fontFamily: theme.font.mono,
  fontSize: theme.size.small,
  color: theme.color.textMuted,
  marginBottom: theme.space.md,
};

const smallHint: CSSProperties = {
  fontSize: theme.size.tiny,
  color: theme.color.textDim,
  fontStyle: 'italic',
  marginTop: theme.space.md,
  lineHeight: 1.5,
};
