import { CSSProperties } from 'react';
import { useGame } from '../state/GameStore';
import { useBattleOrchestrator } from '../hooks/useBattleOrchestrator';
import { Shell } from '../components/Shell';
import { Button } from '../components/Button';
import { theme } from '../styles/theme';
import { MATERIALS } from '../data/materials';
import { WEAPONS } from '../data/weapons';
import { ARMORS } from '../data/armors';
import { DISKS } from '../data/disks';
import { ITEMS } from '../data/items';

export function PostFightScreen() {
  const { state } = useGame();
  const { ackPostFight } = useBattleOrchestrator();
  const d = state.postFight;
  if (!d) return null;

  return (
    <Shell>
      <div style={{ ...bannerStyle, background: d.won ? theme.color.success : theme.color.danger }}>
        {d.won ? 'VICTORY' : 'DEFEAT'}
      </div>
      <div style={subStyle}>
        {d.title}
        {d.isTournamentMidBracket && ' · ROUND COMPLETE'}
      </div>

      <div style={rewardBoxStyle}>
        <div style={rewardLineStyle}><span>PRIZE</span><span style={rewardValueStyle}>+{d.prize.toLocaleString()} CR</span></div>
        <div style={rewardLineStyle}><span>XP / FIGHTER</span><span style={rewardValueStyle}>+{d.xpReward}</span></div>
        {d.fameGained > 0 && (
          <div style={rewardLineStyle}><span>FAME</span><span style={{ ...rewardValueStyle, color: theme.color.accent }}>+{d.fameGained}</span></div>
        )}
      </div>

      {d.summary && (
        <div style={summaryBoxStyle}>
          <div style={summaryHeadStyle}>BATTLE STATS</div>
          <div style={summaryGridStyle}>
            <div><span style={sumLblStyle}>HITS</span><span>{d.summary.hits}</span></div>
            <div><span style={sumLblStyle}>CRITS</span><span>{d.summary.crits}</span></div>
            <div><span style={sumLblStyle}>DMG DONE</span><span>{d.summary.dmgDealt}</span></div>
            <div><span style={sumLblStyle}>DMG TAKEN</span><span>{d.summary.dmgTaken}</span></div>
          </div>
        </div>
      )}

      {d.materialDrops.length > 0 && (
        <>
          <div style={sectionStyle}>MATERIALS RECOVERED</div>
          {d.materialDrops.map((m, i) => {
            const mat = MATERIALS[m.id];
            if (!mat) return null;
            return (
              <div key={i} style={lootRowStyle}>
                <span>◇ {mat.name} ×{m.count}</span>
                <span style={lootMetaStyle}>{mat.sellPrice * m.count} CR @ market</span>
              </div>
            );
          })}
        </>
      )}

      {d.lootDrops.length > 0 && (
        <>
          <div style={sectionStyle}>LOOT</div>
          {d.lootDrops.map((l, i) => {
            const name = l.kind === 'item' ? ITEMS[l.id]?.name :
                         l.kind === 'weapon' ? WEAPONS[l.id]?.name :
                         l.kind === 'armor' ? ARMORS[l.id]?.name :
                         DISKS[l.id]?.name;
            return (
              <div key={i} style={lootRowStyle}>
                <span>◇ {name}</span>
                <span style={lootMetaStyle}>{l.kind.toUpperCase()}</span>
              </div>
            );
          })}
        </>
      )}

      <Button full onClick={ackPostFight} style={{ marginTop: theme.space.lg }}>
        {d.isTournamentMidBracket ? 'NEXT ROUND →' : 'CONTINUE →'}
      </Button>
    </Shell>
  );
}

const bannerStyle: CSSProperties = {
  textAlign: 'center',
  padding: 16,
  fontFamily: theme.font.display,
  fontSize: 32,
  letterSpacing: '6px',
  color: '#000',
};

const subStyle: CSSProperties = {
  textAlign: 'center',
  fontFamily: theme.font.mono,
  fontSize: theme.size.small,
  color: theme.color.textMuted,
  letterSpacing: theme.letter.wide,
  marginBottom: theme.space.lg,
};

const rewardBoxStyle: CSSProperties = {
  background: theme.color.bgRaised,
  border: `1px solid ${theme.color.border}`,
  padding: theme.space.lg,
  display: 'flex',
  flexDirection: 'column',
  gap: 8,
};

const rewardLineStyle: CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  fontFamily: theme.font.mono,
  fontSize: theme.size.body,
  color: theme.color.textMuted,
  letterSpacing: theme.letter.normal,
};

const rewardValueStyle: CSSProperties = {
  color: theme.color.success,
  fontWeight: 800,
  fontSize: 15,
};

const summaryBoxStyle: CSSProperties = {
  background: theme.color.bgRaised,
  border: `1px solid ${theme.color.border}`,
  padding: theme.space.md,
  marginTop: theme.space.md,
};

const summaryHeadStyle: CSSProperties = {
  fontFamily: theme.font.mono,
  fontSize: theme.size.tiny,
  color: theme.color.info,
  letterSpacing: theme.letter.wide,
  marginBottom: 8,
};

const summaryGridStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(2, 1fr)',
  gap: 6,
  fontFamily: theme.font.mono,
  fontSize: 11,
};

const sumLblStyle: CSSProperties = { color: theme.color.textDim, marginRight: 6 };

const sectionStyle: CSSProperties = {
  fontFamily: theme.font.mono,
  fontSize: theme.size.tiny,
  color: theme.color.accent,
  letterSpacing: theme.letter.wide,
  marginTop: theme.space.lg,
  marginBottom: 6,
};

const lootRowStyle: CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  padding: '6px 10px',
  background: theme.color.panel,
  borderLeft: `2px solid ${theme.color.info}`,
  marginBottom: 4,
};

const lootMetaStyle: CSSProperties = {
  fontFamily: theme.font.mono,
  fontSize: theme.size.tiny,
  color: theme.color.info,
  letterSpacing: theme.letter.normal,
};
