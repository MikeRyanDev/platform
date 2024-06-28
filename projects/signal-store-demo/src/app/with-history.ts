import {
  signalStoreFeature,
  type,
  withEvents,
  withMetaReducer,
  withState,
} from '@ngrx/signals';

export interface History {
  committed: unknown[];
  staged: unknown[];
}

export interface HistoryState {
  history: History;
}

const initialHistoryState: HistoryState = {
  history: {
    committed: [],
    staged: [],
  },
};

export function withHistory<State extends object>(
  ...trackedKeys: (keyof State)[]
) {
  return signalStoreFeature(
    { state: type<State>() },
    withState(initialHistoryState),
    withEvents({
      undo: () => ({}),
      redo: () => ({}),
    }),
    withMetaReducer((reducer) => {
      const initialState = reducer(undefined, {
        type: '@@history/init',
      } as any);

      return (state, event) => {
        if (!state) {
          const nextState = reducer(state, event);

          return Object.assign({}, nextState, initialHistoryState);
        }

        if (event.type === 'undo') {
          if (state.history.committed.length === 0) {
            return state;
          }

          const lastEvent =
            state.history.committed[state.history.committed.length - 1];
          const committed = state.history.committed.slice(0, -1);
          const staged = [lastEvent, ...state.history.staged];

          const nextState = committed.reduce(
            (state, event) => reducer(state as any, event as any),
            initialState
          );
          const changes = trackedKeys.reduce(
            (acc, key) => ({ ...acc, [key]: (nextState as State)[key] }),
            {}
          );

          return {
            ...state,
            ...changes,
            history: { staged, committed },
          };
        }

        if (event.type === 'redo') {
          if (state.history.staged.length === 0) {
            return state;
          }

          const [nextEvent, ...staged] = state.history.staged;
          const committed = [...state.history.committed, nextEvent];

          const nextState = committed.reduce(
            (state, event) => reducer(state as any, event as any),
            initialState
          );
          const changes = trackedKeys.reduce(
            (acc, key) => ({ ...acc, [key]: (nextState as State)[key] }),
            {}
          );

          return {
            ...state,
            ...changes,
            history: { staged, committed },
          };
        }

        const nextState = reducer(state, event);
        const hasChanged = trackedKeys.some(
          (key) => (state as State)[key] !== (nextState as State)[key]
        );

        if (hasChanged) {
          return {
            ...nextState,
            history: {
              committed: [...state.history.committed, event],
              staged: [],
            },
          };
        }

        return nextState;
      };
    })
  );
}
