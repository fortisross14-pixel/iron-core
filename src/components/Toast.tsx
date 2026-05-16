import { useEffect } from 'react';
import { theme } from '../styles/theme';
import { useGame } from '../state/GameStore';

export function Toast() {
  const { state, dispatch } = useGame();

  useEffect(() => {
    if (!state.toast) return;
    const t = window.setTimeout(() => dispatch({ type: 'TOAST_CLEAR' }), 3000);
    return () => window.clearTimeout(t);
  }, [state.toast, state.toastId, dispatch]);

  if (!state.toast) return null;
  return (
    <div style={{
      position: 'fixed',
      bottom: 88,
      left: '50%',
      transform: 'translateX(-50%)',
      background: theme.color.panel,
      border: `1px solid ${theme.color.accent}`,
      color: '#fff',
      padding: '10px 16px',
      fontSize: theme.size.small,
      letterSpacing: theme.letter.tight,
      boxShadow: `0 0 18px ${theme.color.accent}40`,
      zIndex: theme.z.toast,
      maxWidth: 420,
    }} className="ic-fade-in">
      {state.toast}
    </div>
  );
}
