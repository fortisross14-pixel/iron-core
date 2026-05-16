import { CSSProperties } from 'react';
import { theme } from '../styles/theme';
import { useGame } from '../state/GameStore';
import { STORY_SCENES } from '../data/story';
import { Button } from './Button';

const SPEAKER_LABEL: Record<string, { name: string; color: string }> = {
  narrator:         { name: '',                  color: theme.color.textMuted },
  uncle:            { name: 'UNCLE',             color: theme.color.accent },
  krait:            { name: 'KRAIT',             color: theme.color.warning },
  player:           { name: 'YOU',               color: theme.color.info },
  grove_keeper:     { name: 'GROVE-KEEPER',      color: theme.factionColor.naturesOwn },
  elemental_chief:  { name: 'ELEMENTAL CHIEF',   color: theme.factionColor.elementalists },
  industrial_clerk: { name: 'INDUSTRIAL CLERK',  color: theme.factionColor.industrials },
  school_principal: { name: 'PRINCIPAL',         color: theme.color.info },
};

export function DialogOverlay() {
  const { state, dispatch } = useGame();
  if (state.dialogStack.length === 0) return null;
  const top = state.dialogStack[state.dialogStack.length - 1];
  const scene = STORY_SCENES[top.sceneId];
  if (!scene) return null;
  const line = scene.lines[top.lineIndex];
  if (!line) return null;
  const isLast = top.lineIndex >= scene.lines.length - 1;
  const speakerInfo = SPEAKER_LABEL[line.speaker] ?? SPEAKER_LABEL.narrator;
  const hasChoices = isLast && (scene.choices?.length ?? 0) > 0;

  return (
    <div style={overlayStyle} onClick={() => !hasChoices && dispatch({ type: 'DIALOG_ADVANCE' })}>
      <div style={panelStyle} onClick={(e) => e.stopPropagation()}>
        {speakerInfo.name && (
          <div style={{ ...speakerStyle, color: speakerInfo.color }}>{speakerInfo.name}</div>
        )}
        <div style={textStyle}>{line.text}</div>

        {hasChoices ? (
          <div style={choicesStyle}>
            {scene.choices!.map((c, i) => (
              <Button key={i} variant="secondary" onClick={() => dispatch({ type: 'DIALOG_CHOICE', choiceIndex: i })}>
                {c.label}
              </Button>
            ))}
          </div>
        ) : (
          <div style={hintStyle}>
            {top.lineIndex + 1} / {scene.lines.length} · tap to continue →
          </div>
        )}
      </div>
    </div>
  );
}

const overlayStyle: CSSProperties = {
  position: 'fixed',
  inset: 0,
  background: 'rgba(0,0,0,0.8)',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'flex-end',
  zIndex: theme.z.modal,
  cursor: 'pointer',
  animation: 'ic-fade-in 0.3s ease',
};

const panelStyle: CSSProperties = {
  background: theme.color.bgRaised,
  borderTop: `2px solid ${theme.color.accent}`,
  padding: theme.space.xl,
  maxWidth: theme.maxWidth,
  width: '100%',
  margin: '0 auto',
  cursor: 'default',
};

const speakerStyle: CSSProperties = {
  fontFamily: theme.font.display,
  fontSize: theme.size.body,
  letterSpacing: theme.letter.wide,
  marginBottom: theme.space.md,
};

const textStyle: CSSProperties = {
  fontFamily: theme.font.body,
  fontSize: theme.size.body,
  lineHeight: 1.6,
  color: theme.color.text,
  minHeight: 80,
};

const hintStyle: CSSProperties = {
  marginTop: theme.space.lg,
  fontFamily: theme.font.mono,
  fontSize: theme.size.tiny,
  color: theme.color.textDim,
  letterSpacing: theme.letter.normal,
  textAlign: 'right',
};

const choicesStyle: CSSProperties = {
  marginTop: theme.space.lg,
  display: 'flex',
  flexDirection: 'column',
  gap: theme.space.sm,
};
