/**
 * RankingScreen — Mecha Trainer Ranking.
 *
 * Top-level tab, NOT inside any location.
 * Reads:
 *   - state.fame, state.playerTier, state.defeatedTrainerIds
 *   - ALL_TRAINERS data
 *
 * Layout:
 *   - tier picker (Amateur tab active, others locked until tier achieved)
 *   - sorted list of all trainers in the tier + the player, with rank #
 *   - defeated trainers show a green checkmark
 *   - player row is highlighted
 *
 * No combat logic, no fame logic, no challenge logic in this file.
 * (Trainer challenge happens elsewhere — TBD in next step.)
 */

import { CSSProperties } from 'react';
import { useGame } from '../state/GameStore';
import { Shell } from '../components/Shell';
import { Button } from '../components/Button';
import { theme } from '../styles/theme';
import { buildRankings } from '../game/fame';
import { TIER_ORDER, TIER_LABEL, TIER_COLOR } from '../game/tier';
import { tierIndex, canChallengeTrainer } from '../game/tier';
import { MODELS } from '../data/models';
import type { TrainerTier, Trainer } from '../data/trainers';
import type { PendingBattle } from '../state/types';
import { useState } from 'react';

export function RankingScreen() {
  const { state, dispatch } = useGame();
  const [viewTier, setViewTier] = useState<TrainerTier>(state.playerTier);
  const [challenging, setChallenging] = useState<Trainer | null>(null);
  const playerTierIdx = tierIndex(state.playerTier);

  const entries = buildRankings(state.fame, viewTier, state.defeatedTrainerIds);

  const startChallenge = (t: Trainer) => {
    // Use the lead model of the trainer's team for the fight
    const lead = t.team[0];
    if (!lead) return;
    const battle: PendingBattle = {
      source: 'trainer',
      sourceId: t.id,
      oppLevel: lead.level,
      oppRank: 'competitor',
      teamSize: t.team.length,
      trainerId: t.id,
      forceModelId: lead.modelId,
      forceFirstName: t.firstName,
      prize: Math.round(t.fame * 0.4 + 20),
      xpReward: 40 + lead.level * 8,
    };
    setChallenging(null);
    dispatch({ type: 'QUEUE_BATTLE', battle });
  };

  return (
    <Shell>
      <button onClick={() => dispatch({ type: 'GO_SCENE', scene: 'town' })} style={backStyle}>← BACK</button>

      <div style={titleStyle}>MECHA TRAINER RANKING</div>

      <div style={youCardStyle}>
        <div style={youHeadStyle}>
          <span style={youLabelStyle}>YOU</span>
          <span style={{ ...tierBadgeStyle, color: TIER_COLOR[state.playerTier], borderColor: TIER_COLOR[state.playerTier] }}>
            {TIER_LABEL[state.playerTier]}
          </span>
        </div>
        <div style={youStatsStyle}>
          <div><span style={statLblStyle}>FAME</span> <span style={statValStyle}>{state.fame}</span></div>
          <div><span style={statLblStyle}>DEFEATED</span> <span style={statValStyle}>{state.defeatedTrainerIds.size}</span></div>
        </div>
      </div>

      {/* TIER TABS */}
      <div style={tabsStyle}>
        {TIER_ORDER.map(tier => {
          const idx = tierIndex(tier);
          const locked = idx > playerTierIdx;
          const active = tier === viewTier;
          return (
            <button
              key={tier}
              onClick={() => !locked && setViewTier(tier)}
              disabled={locked}
              style={{
                ...tabStyle,
                ...(active ? { ...activeTabStyle, borderColor: TIER_COLOR[tier], color: TIER_COLOR[tier] } : {}),
                ...(locked ? lockedTabStyle : {}),
              }}>
              {TIER_LABEL[tier]}{locked && ' 🔒'}
            </button>
          );
        })}
      </div>

      <div style={hintStyle}>Tap a trainer to challenge them.</div>

      {/* RANKING LIST */}
      <div style={listStyle}>
        {entries.map((e, i) => {
          if (e.kind === 'player') {
            return (
              <div key={`p-${i}`} style={playerRowStyle}>
                <div style={rankColStyle}>#{e.rank}</div>
                <div style={nameColStyle}>
                  <div style={{ ...nameTextStyle, color: theme.color.accent }}>YOU</div>
                </div>
                <div style={fameColStyle}>{e.fame}</div>
              </div>
            );
          } else {
            const t = e.trainer;
            const canFight = canChallengeTrainer(state.playerTier, t.tier);
            return (
              <button key={t.id}
                onClick={() => canFight && state.bots.length > 0 && setChallenging(t)}
                disabled={!canFight || state.bots.length === 0}
                style={{
                  ...rowStyle,
                  ...(e.defeated ? defeatedRowStyle : {}),
                  ...(!canFight ? lockedRowStyle : {}),
                }}>
                <div style={rankColStyle}>#{e.rank}</div>
                <div style={nameColStyle}>
                  <div style={nameTextStyle}>
                    {t.firstName} {t.surname}
                    {e.defeated && <span style={defeatedBadgeStyle}>✓</span>}
                    {!canFight && <span style={lockedBadgeStyle}>🔒</span>}
                  </div>
                  <div style={flavorStyle}>{t.flavor}</div>
                </div>
                <div style={fameColStyle}>{t.fame}</div>
              </button>
            );
          }
        })}
      </div>

      {challenging && (
        <ChallengeModal
          trainer={challenging}
          onConfirm={() => startChallenge(challenging)}
          onCancel={() => setChallenging(null)}
          alreadyDefeated={state.defeatedTrainerIds.has(challenging.id)}
        />
      )}
    </Shell>
  );
}

function ChallengeModal({ trainer, onConfirm, onCancel, alreadyDefeated }: {
  trainer: Trainer; onConfirm: () => void; onCancel: () => void; alreadyDefeated: boolean;
}) {
  // Estimate fame reward shown in the modal — matches /game/fame.ts formula
  const fameReward = alreadyDefeated ? 1 : Math.max(1, Math.round(trainer.fame * 0.10 + 5));

  return (
    <div style={modalOverlayStyle} onClick={onCancel}>
      <div style={modalStyle} onClick={e => e.stopPropagation()}>
        <div style={modalTitleStyle}>{trainer.firstName} {trainer.surname}</div>
        <div style={modalFlavorStyle}>{trainer.flavor}</div>
        <div style={modalStatRowStyle}>
          <div><span style={modalLblStyle}>FAME</span> <span style={modalValStyle}>{trainer.fame}</span></div>
          <div><span style={modalLblStyle}>TEAM</span> <span style={modalValStyle}>×{trainer.team.length}</span></div>
          <div><span style={modalLblStyle}>LEAD LV</span> <span style={modalValStyle}>{trainer.team[0]?.level ?? '?'}</span></div>
        </div>
        <div style={modalTeamRowStyle}>
          {trainer.team.map((slot, i) => {
            const m = MODELS[slot.modelId];
            return (
              <span key={i} style={modalTeamChipStyle}>
                {m?.surname ?? '???'} <span style={{ color: theme.color.textDim }}>LV{slot.level}</span>
              </span>
            );
          })}
        </div>
        <div style={modalRewardStyle}>
          On win: <span style={{ color: theme.color.accent }}>+{fameReward} fame</span>
          {alreadyDefeated && <span style={{ color: theme.color.textDim }}> (repeat win)</span>}
        </div>
        <div style={modalButtonsStyle}>
          <Button variant="secondary" small full onClick={onCancel}>CANCEL</Button>
          <Button small full onClick={onConfirm}>CHALLENGE →</Button>
        </div>
      </div>
    </div>
  );
}

const hintStyle: CSSProperties = {
  fontFamily: theme.font.mono,
  fontSize: theme.size.tiny,
  color: theme.color.textMuted,
  letterSpacing: theme.letter.wide,
  marginBottom: theme.space.sm,
  textAlign: 'center',
};

const lockedRowStyle: CSSProperties = {
  opacity: 0.5,
  cursor: 'not-allowed',
};

const lockedBadgeStyle: CSSProperties = {
  color: theme.color.textDim,
  fontSize: theme.size.micro,
};

const modalOverlayStyle: CSSProperties = {
  position: 'fixed', inset: 0,
  background: 'rgba(0,0,0,0.85)',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  zIndex: theme.z.modal,
  padding: theme.space.lg,
};

const modalStyle: CSSProperties = {
  background: theme.color.bgRaised,
  border: `1px solid ${theme.color.accent}`,
  padding: theme.space.lg,
  maxWidth: 360,
  width: '100%',
};

const modalTitleStyle: CSSProperties = {
  fontFamily: theme.font.display,
  fontSize: theme.size.h2,
  letterSpacing: theme.letter.wide,
  color: '#fff',
  marginBottom: 4,
};

const modalFlavorStyle: CSSProperties = {
  fontFamily: theme.font.body,
  fontStyle: 'italic',
  fontSize: theme.size.small,
  color: theme.color.textDim,
  marginBottom: theme.space.md,
  lineHeight: 1.5,
};

const modalStatRowStyle: CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  fontFamily: theme.font.mono,
  fontSize: theme.size.tiny,
  padding: theme.space.sm,
  background: theme.color.panel,
  marginBottom: theme.space.sm,
};

const modalLblStyle: CSSProperties = {
  color: theme.color.textDim,
  letterSpacing: theme.letter.wide,
  marginRight: 4,
};

const modalValStyle: CSSProperties = {
  color: theme.color.accent,
  fontWeight: 800,
};

const modalTeamRowStyle: CSSProperties = {
  display: 'flex', flexWrap: 'wrap', gap: 4,
  marginBottom: theme.space.sm,
};

const modalTeamChipStyle: CSSProperties = {
  fontFamily: theme.font.mono,
  fontSize: theme.size.micro,
  padding: '2px 6px',
  border: `1px solid ${theme.color.border}`,
  background: theme.color.panel,
  color: theme.color.text,
};

const modalRewardStyle: CSSProperties = {
  fontFamily: theme.font.mono,
  fontSize: theme.size.small,
  color: theme.color.text,
  padding: theme.space.sm,
  background: theme.color.bgSunken,
  textAlign: 'center',
  marginBottom: theme.space.md,
};

const modalButtonsStyle: CSSProperties = {
  display: 'flex',
  gap: theme.space.sm,
};

const backStyle: CSSProperties = {
  background: 'transparent', border: 'none', color: theme.color.textMuted,
  fontFamily: theme.font.mono, fontSize: theme.size.tiny, letterSpacing: theme.letter.wide,
  cursor: 'pointer', padding: 0, marginBottom: theme.space.md,
};

const titleStyle: CSSProperties = {
  fontFamily: theme.font.display, fontSize: theme.size.h1,
  letterSpacing: theme.letter.wider, color: '#fff', marginBottom: theme.space.md,
};

const youCardStyle: CSSProperties = {
  background: theme.color.bgRaised,
  border: `1px solid ${theme.color.accent}`,
  padding: theme.space.md,
  marginBottom: theme.space.lg,
};

const youHeadStyle: CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: theme.space.sm,
};

const youLabelStyle: CSSProperties = {
  fontFamily: theme.font.display,
  fontSize: theme.size.h3,
  letterSpacing: theme.letter.wide,
  color: theme.color.accent,
};

const tierBadgeStyle: CSSProperties = {
  fontFamily: theme.font.mono,
  fontSize: theme.size.tiny,
  letterSpacing: theme.letter.wide,
  padding: '2px 6px',
  border: '1px solid',
  borderRadius: 2,
};

const youStatsStyle: CSSProperties = {
  display: 'flex',
  gap: theme.space.lg,
  fontFamily: theme.font.mono,
  fontSize: theme.size.small,
};

const statLblStyle: CSSProperties = {
  fontSize: theme.size.micro,
  color: theme.color.textDim,
  letterSpacing: theme.letter.wide,
};

const statValStyle: CSSProperties = {
  color: theme.color.accent,
  fontSize: theme.size.h3,
  fontWeight: 800,
  marginLeft: 4,
};

const tabsStyle: CSSProperties = {
  display: 'flex',
  gap: 4,
  marginBottom: theme.space.md,
};

const tabStyle: CSSProperties = {
  flex: 1,
  padding: '6px 2px',
  background: 'transparent',
  color: theme.color.textDim,
  fontFamily: theme.font.display,
  fontSize: 10,
  letterSpacing: theme.letter.wide,
  border: '1px solid transparent',
  cursor: 'pointer',
};

const activeTabStyle: CSSProperties = {
  background: theme.color.panel,
  borderBottom: '2px solid',
};

const lockedTabStyle: CSSProperties = {
  opacity: 0.3,
  cursor: 'not-allowed',
};

const listStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 4,
};

const rowStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: '40px 1fr 60px',
  gap: theme.space.sm,
  alignItems: 'center',
  padding: '8px 10px',
  background: theme.color.bgRaised,
  border: `1px solid ${theme.color.border}`,
  textAlign: 'left',
  color: theme.color.text,
  font: 'inherit',
  cursor: 'pointer',
  width: '100%',
};

const defeatedRowStyle: CSSProperties = {
  borderLeft: `2px solid ${theme.color.success}`,
  opacity: 0.85,
};

const playerRowStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: '40px 1fr 60px',
  gap: theme.space.sm,
  alignItems: 'center',
  padding: '10px 10px',
  background: '#1a0f0a',
  border: `1px solid ${theme.color.accent}`,
  boxShadow: `0 0 10px ${theme.color.accent}40`,
};

const rankColStyle: CSSProperties = {
  fontFamily: theme.font.mono,
  fontSize: theme.size.small,
  color: theme.color.textMuted,
  letterSpacing: theme.letter.tight,
};

const nameColStyle: CSSProperties = { minWidth: 0 };

const nameTextStyle: CSSProperties = {
  fontFamily: theme.font.display,
  fontSize: theme.size.body,
  letterSpacing: theme.letter.tight,
  color: theme.color.text,
  display: 'flex',
  alignItems: 'center',
  gap: 6,
};

const flavorStyle: CSSProperties = {
  fontFamily: theme.font.body,
  fontStyle: 'italic',
  fontSize: theme.size.tiny,
  color: theme.color.textDim,
  marginTop: 2,
};

const fameColStyle: CSSProperties = {
  fontFamily: theme.font.mono,
  fontSize: theme.size.body,
  color: theme.color.accent,
  fontWeight: 800,
  textAlign: 'right',
};

const defeatedBadgeStyle: CSSProperties = {
  color: theme.color.success,
  fontWeight: 800,
};
