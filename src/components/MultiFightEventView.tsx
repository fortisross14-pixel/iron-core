/**
 * MultiFightEventView — the reusable vertical fight list.
 *
 * Renders any MultiFightEvent (tournament, tier_test, gauntlet) the same way:
 *   - title, flavor, desc, champion bonus line
 *   - vertical list of fights:
 *       cleared: ✓ + green border + grayed name
 *       next-up: highlighted, opponent name + subtitle visible, "FIGHT →" button
 *       locked:  🔒 + name hidden ("Examiner II — locked")
 *
 * The component reads state.eventProgress[event.id] to know how far the player
 * has gotten. It is text- and data-driven; nothing visual is hardcoded per event.
 *
 * Used by:
 *   - AcademyLocationView (Senior Cup)
 *   - TournamentHallLocationView (Voltspire Bronze)
 *   - OfficialsHallLocationView (Official Test)
 *   - …any future event
 */

import { CSSProperties } from 'react';
import { useGame } from '../state/GameStore';
import { Button } from './Button';
import { theme } from '../styles/theme';
import { ALL_TRAINERS } from '../data/trainers';
import { tierIndex, TIER_LABEL } from '../game/tier';
import type { MultiFightEvent } from '../data/multifight';
import type { PendingBattle } from '../state/types';

export function MultiFightEventView({ event }: { event: MultiFightEvent }) {
  const { state, dispatch } = useGame();

  // Gate checks
  const flagsOk = event.requires.storyFlags?.every(f => state.storyFlags.has(f)) ?? true;
  const fameOk = event.requires.minFame === undefined || state.fame >= event.requires.minFame;
  // Tier gate: tournaments require player to be at or above the tournament's tier.
  // Tier tests have their own gate logic and ignore this check.
  const tierOk = event.kind === 'tier_test'
    || tierIndex(state.playerTier) >= tierIndex(event.tier);
  const hasBots = state.bots.length >= event.teamSize;
  const canAffordEntry = state.money >= event.entry;

  // Rejection messaging (data-driven; tier rejection is generated from tier names)
  let rejection: string | null = null;
  if (!tierOk) {
    rejection = `${TIER_LABEL[event.tier]} TIER — pass the ${TIER_LABEL[event.tier]} Test first.`;
  } else if (!flagsOk) {
    rejection = event.requires.rejectionIfFlagMissing ?? 'You aren\'t eligible to enter yet.';
  } else if (!fameOk) {
    rejection = event.requires.rejectionIfLowFame ?? `Minimum fame: ${event.requires.minFame}.`;
  }

  // Progress
  const progress = state.eventProgress[event.id] ?? -1;     // highest cleared index
  const nextUpIndex = progress + 1;                          // -1 → 0 (first not yet cleared)
  const fullyComplete = progress >= event.bracket.length - 1;

  const enterFight = (idx: number) => {
    const f = event.bracket[idx];
    const trainer = f.trainerId ? ALL_TRAINERS[f.trainerId] : null;
    const battle: PendingBattle = {
      source: event.kind === 'tournament' ? 'tournament' : 'event',
      sourceId: event.id,
      oppLevel: f.oppLevel,
      oppRank: 'competitor',
      teamSize: f.teamSize ?? event.teamSize,
      trainerId: f.trainerId,
      forceModelId: trainer?.team[0]?.modelId,
      forceFirstName: trainer?.firstName,
      prize: f.prizeOnWin,
      xpReward: f.xpOnWin,
      fameReward: f.fameOnWin,
      eventId: event.id,
      eventFightIndex: idx,
    };
    dispatch({ type: 'QUEUE_BATTLE', battle });
  };

  return (
    <div>
      <div style={{ ...cardStyle, ...(!tierOk ? tierLockedCardStyle : {}) }}>
        <div style={titleRowStyle}>
          <div style={nameStyle}>{event.name.toUpperCase()}</div>
          <div style={{ ...tierBadgeStyle, ...tierBadgeColors(event.tier) }}>
            {TIER_LABEL[event.tier]}
          </div>
        </div>
        {event.flavor && <div style={flavorStyle}>{event.flavor}</div>}
        <div style={descStyle}>{event.desc}</div>
        <div style={metaStyle}>
          {event.bracket.length} fights · {event.teamSize}v{event.teamSize}
          {event.championFameBonus > 0 && ` · champion bonus: +${event.championFameBonus} fame`}
          {event.championPrizeBonus > 0 && `, +${event.championPrizeBonus} CR`}
        </div>

        {fullyComplete && (
          <div style={completedBannerStyle}>✓ COMPLETED{event.reEnterable && ' · RE-ENTERABLE'}</div>
        )}

        {rejection ? (
          <div style={rejectionStyle}>{rejection}</div>
        ) : !hasBots ? (
          <div style={rejectionStyle}>You need {event.teamSize} bot{event.teamSize > 1 ? 's' : ''} in your stable.</div>
        ) : !canAffordEntry ? (
          <div style={rejectionStyle}>Entry fee is {event.entry} CR. You don't have enough.</div>
        ) : null}

        <div style={bracketStyle}>
          {event.bracket.map((f, i) => {
            const cleared = i <= progress;
            const isNext = i === nextUpIndex && !fullyComplete;
            const locked = i > nextUpIndex || (fullyComplete && !event.reEnterable);
            const tr = f.trainerId ? ALL_TRAINERS[f.trainerId] : null;

            return (
              <div key={i} style={{
                ...fightRowStyle,
                ...(cleared ? clearedStyle : {}),
                ...(isNext ? nextStyle : {}),
                ...(locked ? lockedStyle : {}),
              }}>
                <div style={fightIdxStyle}>
                  {cleared ? '✓' : locked ? '🔒' : `${i + 1}`}
                </div>
                <div style={fightBodyStyle}>
                  {locked && !cleared ? (
                    <>
                      <div style={fightNameStyle}>— locked —</div>
                      <div style={fightSubStyle}>Clear fight {i} to unlock.</div>
                    </>
                  ) : (
                    <>
                      <div style={fightNameStyle}>
                        {tr ? `${tr.firstName} ${tr.surname}` : `Opponent ${i + 1}`}
                        <span style={fightLevelStyle}>LV {f.oppLevel}</span>
                      </div>
                      {f.subtitle && <div style={fightSubStyle}>{f.subtitle}</div>}
                      {!cleared && <div style={fightRewardStyle}>+{f.fameOnWin} fame · +{f.prizeOnWin} CR</div>}
                    </>
                  )}
                </div>
                {isNext && !rejection && hasBots && canAffordEntry && (
                  <Button small onClick={() => enterFight(i)} style={{ alignSelf: 'center' }}>
                    FIGHT →
                  </Button>
                )}
                {cleared && event.reEnterable && !rejection && hasBots && (
                  <Button small variant="secondary" onClick={() => enterFight(i)} style={{ alignSelf: 'center' }}>
                    REPLAY
                  </Button>
                )}
              </div>
            );
          })}
        </div>

        {fullyComplete && event.championSpeech && (
          <div style={victoryPanelStyle}>
            <div style={victoryHeadStyle}>★ TOURNAMENT WON ★</div>
            {event.championMedal && (
              <div style={medalStyle}>Awarded: <span style={medalNameStyle}>{event.championMedal}</span></div>
            )}
            <div style={speechStyle}>
              "{event.championSpeech.replace('%PLAYER%', state.playerName || 'champion')}"
            </div>
            {event.championSpeakerName && (
              <div style={speakerLineStyle}>
                <span style={speakerNameStyle}>— {event.championSpeakerName}</span>
                {event.championSpeakerTitle && (
                  <span style={speakerTitleStyle}>, {event.championSpeakerTitle}</span>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

const cardStyle: CSSProperties = {
  background: theme.color.bgRaised,
  border: `1px solid ${theme.color.border}`,
  padding: theme.space.md,
};

const victoryPanelStyle: CSSProperties = {
  marginTop: theme.space.lg,
  padding: theme.space.md,
  background: `linear-gradient(180deg, ${theme.color.gold}15 0%, ${theme.color.bgSunken} 100%)`,
  border: `1px solid ${theme.color.gold}`,
  position: 'relative',
};

const victoryHeadStyle: CSSProperties = {
  fontFamily: theme.font.display,
  fontSize: theme.size.h3,
  letterSpacing: theme.letter.wider,
  color: theme.color.gold,
  textAlign: 'center',
  marginBottom: theme.space.sm,
  textShadow: `0 0 12px ${theme.color.gold}80`,
};

const medalStyle: CSSProperties = {
  fontFamily: theme.font.mono,
  fontSize: theme.size.tiny,
  color: theme.color.textMuted,
  textAlign: 'center',
  letterSpacing: theme.letter.normal,
  marginBottom: theme.space.md,
};

const medalNameStyle: CSSProperties = {
  color: theme.color.gold,
  fontWeight: 700,
};

const speechStyle: CSSProperties = {
  fontFamily: theme.font.body,
  fontStyle: 'italic',
  fontSize: theme.size.small,
  color: theme.color.text,
  lineHeight: 1.6,
  padding: `${theme.space.sm}px ${theme.space.md}px`,
  borderLeft: `2px solid ${theme.color.gold}`,
  marginBottom: theme.space.sm,
};

const speakerLineStyle: CSSProperties = {
  fontFamily: theme.font.body,
  fontSize: theme.size.tiny,
  textAlign: 'right',
  marginTop: theme.space.xs,
};

const speakerNameStyle: CSSProperties = {
  color: '#fff',
  fontWeight: 700,
};

const speakerTitleStyle: CSSProperties = {
  color: theme.color.textMuted,
  fontStyle: 'italic',
};

const tierLockedCardStyle: CSSProperties = {
  opacity: 0.55,
};

const titleRowStyle: CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
  gap: 8,
};

const tierBadgeStyle: CSSProperties = {
  fontFamily: theme.font.mono,
  fontSize: theme.size.micro,
  letterSpacing: theme.letter.wide,
  padding: '2px 6px',
  border: '1px solid',
  borderRadius: 2,
  alignSelf: 'flex-start',
  flexShrink: 0,
};

function tierBadgeColors(tier: import('../data/trainers').TrainerTier): CSSProperties {
  const map: Record<string, string> = {
    amateur: '#888',
    official: '#7fb069',
    professional: '#5fa8ff',
    elite: '#ffd700',
  };
  return { color: map[tier], borderColor: map[tier] };
}

const nameStyle: CSSProperties = {
  fontFamily: theme.font.display,
  fontSize: theme.size.h3,
  letterSpacing: theme.letter.wide,
  color: '#fff',
};

const flavorStyle: CSSProperties = {
  fontFamily: theme.font.body,
  fontStyle: 'italic',
  fontSize: theme.size.small,
  color: theme.color.textDim,
  marginTop: 2,
};

const descStyle: CSSProperties = {
  fontSize: theme.size.small,
  color: theme.color.textMuted,
  marginTop: 6,
  lineHeight: 1.5,
};

const metaStyle: CSSProperties = {
  fontFamily: theme.font.mono,
  fontSize: theme.size.tiny,
  color: theme.color.info,
  letterSpacing: theme.letter.tight,
  marginTop: 6,
  marginBottom: theme.space.sm,
};

const completedBannerStyle: CSSProperties = {
  fontFamily: theme.font.display,
  fontSize: theme.size.tiny,
  letterSpacing: theme.letter.wide,
  color: theme.color.success,
  padding: '4px 8px',
  border: `1px solid ${theme.color.success}`,
  background: theme.color.success + '15',
  marginBottom: theme.space.sm,
  textAlign: 'center',
};

const rejectionStyle: CSSProperties = {
  fontFamily: theme.font.body,
  fontStyle: 'italic',
  fontSize: theme.size.small,
  color: theme.color.danger,
  padding: theme.space.sm,
  background: theme.color.danger + '10',
  border: `1px solid ${theme.color.danger}40`,
  marginBottom: theme.space.sm,
  lineHeight: 1.5,
};

const bracketStyle: CSSProperties = {
  marginTop: theme.space.sm,
  display: 'flex',
  flexDirection: 'column',
  gap: 6,
};

const fightRowStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: '32px 1fr auto',
  gap: 8,
  alignItems: 'stretch',
  padding: '8px 10px',
  background: theme.color.panel,
  border: '1px solid transparent',
};

const clearedStyle: CSSProperties = {
  borderColor: theme.color.success,
  background: theme.color.success + '10',
  opacity: 0.85,
};

const nextStyle: CSSProperties = {
  borderColor: theme.color.accent,
  background: theme.color.bgRaised,
  boxShadow: `0 0 8px ${theme.color.accent}40`,
};

const lockedStyle: CSSProperties = {
  opacity: 0.5,
};

const fightIdxStyle: CSSProperties = {
  fontFamily: theme.font.mono,
  fontSize: theme.size.body,
  color: theme.color.accent,
  textAlign: 'center',
  alignSelf: 'center',
};

const fightBodyStyle: CSSProperties = {
  minWidth: 0,
};

const fightNameStyle: CSSProperties = {
  fontFamily: theme.font.display,
  fontSize: theme.size.body,
  color: theme.color.text,
  letterSpacing: theme.letter.tight,
  display: 'flex',
  alignItems: 'center',
  gap: 6,
};

const fightLevelStyle: CSSProperties = {
  fontFamily: theme.font.mono,
  fontSize: theme.size.micro,
  color: theme.color.info,
  letterSpacing: theme.letter.tight,
};

const fightSubStyle: CSSProperties = {
  fontFamily: theme.font.body,
  fontStyle: 'italic',
  fontSize: theme.size.tiny,
  color: theme.color.textDim,
  marginTop: 2,
};

const fightRewardStyle: CSSProperties = {
  fontFamily: theme.font.mono,
  fontSize: theme.size.tiny,
  color: theme.color.accent,
  marginTop: 4,
};
