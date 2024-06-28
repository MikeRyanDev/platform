import { DestroyRef, Signal, inject } from '@angular/core';
import { ReducerFn } from './signal-store-models';
import { createStateEngine } from './state-engine';
import { toReduxedReducer } from './reducer-helpers';

export interface ReducedSignal<State extends object, Events>
  extends Signal<State> {
  dispatch(event: Events): void;
}

export function signalReducer<State extends object, Events>(
  reducer: ReducerFn<State, Events>,
  initialState: State,
  initializer?: (initialState: State) => State
): ReducedSignal<State, Events> {
  const actualInitialState = initializer
    ? initializer(initialState)
    : initialState;
  const destroyRef = inject(DestroyRef);
  const core = createStateEngine<State>(actualInitialState, destroyRef);
  const reduxedReducer = toReduxedReducer(actualInitialState, reducer);

  core.reducers.set([reduxedReducer]);

  return Object.assign(core.state, {
    dispatch: (event: Events) => core.dispatcher.next(event),
  });
}
