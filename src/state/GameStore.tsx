import { createContext, useContext, useReducer, useCallback, useMemo, ReactNode } from 'react';
import { reducer } from './reducer';
import { initialState } from './initialState';
import type { GameState } from './types';
import type { Action } from './actions';

interface StoreCtx {
  state: GameState;
  dispatch: (a: Action) => void;
}

const Ctx = createContext<StoreCtx | null>(null);

export function GameStore({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const value = useMemo(() => ({ state, dispatch }), [state]);
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
