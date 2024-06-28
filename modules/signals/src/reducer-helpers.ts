import {
  ReduxedReducerFn,
  EventsDictionary,
  ReducerFn,
  StateChangeResult,
  MetaReducerFn,
} from './signal-store-models';

export function resolveChangesToApply<State extends object>(
  result: StateChangeResult<State>,
  state: State
): State {
  if (Array.isArray(result)) {
    return result.reduce((acc, change) => change(acc), state);
  }

  if (result instanceof Function) {
    return result(state);
  }

  return result;
}

export function toReduxedReducer<State extends object, Events>(
  initialState: State,
  reducer: ReducerFn<State, Events>
): ReduxedReducerFn<State> {
  const initialKeys = Object.keys(initialState) as (keyof State)[];

  return function (state = initialState, event) {
    const stateThatBelongsToMe = initialKeys.reduce((acc, key) => {
      acc[key] = state[key];
      return acc;
    }, {} as State);
    const currentKeys = Object.keys(state) as (keyof State)[];
    const stateThatDoesNotBelongToMe = currentKeys.reduce((acc, key) => {
      if (!initialKeys.includes(key as any)) {
        acc[key] = state[key];
      }
      return acc;
    }, {} as Partial<State>);

    const changesToApply = resolveChangesToApply(
      reducer(stateThatBelongsToMe, event as any),
      stateThatBelongsToMe
    );
    const updatedStateScopedToMe = initialKeys.reduce((acc, key) => {
      acc[key] = changesToApply[key];
      return acc;
    }, {} as State);

    return {
      ...state,
      ...updatedStateScopedToMe,
      ...stateThatDoesNotBelongToMe,
    };
  };
}

export function mergeReduxedReducers<State>(
  firstReducer: ReduxedReducerFn<State>,
  ...reducers: ReduxedReducerFn<State>[]
): ReduxedReducerFn<State> {
  return function (state, event) {
    return reducers.reduce(
      (acc, reducer) => reducer(acc, event),
      firstReducer(state, event)
    );
  };
}

export function applyMetaReducers<State>(
  reducer: ReduxedReducerFn<State>,
  metaReducers: MetaReducerFn<State>[]
): ReduxedReducerFn<State> {
  return metaReducers.reduce((acc, metaReducer) => metaReducer(acc), reducer);
}
