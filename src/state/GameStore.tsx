import { createContext, useContext, useReducer, useMemo, useEffect, useRef, ReactNode } from 'react';
import { reducer } from './reducer';
import { initialState } from './initialState';
import type { GameState } from './types';
import type { Action } from './actions';
import { writeSave } from './saveLoad';

interface StoreCtx {
  state: GameState;
  dispatch: (a: Action) => void;
}

const Ctx = createContext<StoreCtx | null>(null);

/**
 * GameStore — global state provider.
 *
 * Optional `bootState` parameter lets the app load a saved game on mount.
 * If absent, starts from `initialState` (fresh game).
 *
 * Autosave: every state change triggers a debounced (200ms) write to
 * localStorage. We skip the very first effect run since that's just
 * the initial bootState load — no point re-saving what we just read.
 */
export function GameStore({ children, bootState }: { children: ReactNode; bootState?: GameState }) {
  const [state, dispatch] = useReducer(reducer, bootState ?? initialState);
  const value = useMemo(() => ({ state, dispatch }), [state]);

  // Autosave: write to localStorage 200ms after the most recent state change.
  // The first run is skipped so loading a save doesn't immediately re-save it.
  const firstRun = useRef(true);
  const timerRef = useRef<number | null>(null);
  useEffect(() => {
    if (firstRun.current) {
      firstRun.current = false;
      return;
    }
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current);
    }
    timerRef.current = window.setTimeout(() => {
      writeSave(state);
      timerRef.current = null;
    }, 200);
    return () => {
      if (timerRef.current !== null) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [state]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useGame(): StoreCtx {
  const v = useContext(Ctx);
  if (!v) throw new Error('useGame must be inside <GameStore>');
  return v;
}

/** Convenience: typed dispatch. */
export function useDispatch(): (a: Action) => void {
  return useGame().dispatch;
}
