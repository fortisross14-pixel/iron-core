import { createContext, useContext, useReducer, useMemo, useEffect, useRef, ReactNode } from 'react';
import { reducer } from './reducer';
import { initialState } from './initialState';
import type { GameState } from './types';
import type { Action } from './actions';
import { writeSave, SaveSlot } from './saveLoad';

interface StoreCtx {
  state: GameState;
  dispatch: (a: Action) => void;
  /** The slot autosaves are written to. Surfaced for UI (e.g. ME screen). */
  activeSlot: SaveSlot;
}

const Ctx = createContext<StoreCtx | null>(null);

/**
 * GameStore — global state provider.
 *
 * `bootState` lets the app load a saved game on mount; absent = fresh game.
 * `activeSlot` is the slot autosaves are written to.
 *
 * Autosave: every state change triggers a debounced (200ms) write to the
 * active slot. The very first effect run is skipped so loading a save
 * doesn't immediately re-save it.
 */
export function GameStore({ children, bootState, activeSlot }: {
  children: ReactNode;
  bootState?: GameState;
  activeSlot: SaveSlot;
}) {
  const [state, dispatch] = useReducer(reducer, bootState ?? initialState);
  const value = useMemo(() => ({ state, dispatch, activeSlot }), [state, activeSlot]);

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
      writeSave(activeSlot, state);
      timerRef.current = null;
    }, 200);
    return () => {
      if (timerRef.current !== null) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [state, activeSlot]);

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
