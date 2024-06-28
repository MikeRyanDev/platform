import { DestroyRef, computed, signal } from '@angular/core';
import {
  MetaReducerFn,
  PatchStateCommand,
  StateEngine,
  ReduxedReducerFn,
} from './signal-store-models';
import { Subject, tap } from 'rxjs';
import { applyMetaReducers, mergeReduxedReducers } from './reducer-helpers';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

function isPatchStateCommand(
  event: unknown
): event is PatchStateCommand<unknown> {
  return (
    !!event &&
    typeof event === 'object' &&
    'type' in event &&
    event.type === '@@patch-state' &&
    'updaters' in event &&
    Array.isArray(event.updaters)
  );
}

export function createStateEngine<State>(
  _initialState: State,
  destroyRef?: DestroyRef
): StateEngine<State> {
  const initialState = signal<State>(_initialState);
  const initialReducer = computed((): ReduxedReducerFn<State> => {
    const _initialState = initialState();

    return (state: State = _initialState, event: any) => {
      if (isPatchStateCommand(event)) {
        return event.updaters.reduce((acc: State, updater) => {
          if (typeof updater === 'function') {
            return { ...acc, ...updater(acc) };
          }

          return { ...acc, ...updater };
        }, state);
      }

      return state;
    };
  });
  const dispatcher = new Subject();
  const eventSink = new Subject();
  const events = eventSink.asObservable();
  const reducers = signal<ReduxedReducerFn<State>[]>([]);
  const metaReducers = signal<MetaReducerFn<State>[]>([]);
  const stateResult = signal<State | undefined>(undefined);
  const reduxedReducer = computed(() => {
    const mergedReducers = mergeReduxedReducers(
      initialReducer(),
      ...reducers()
    );

    return applyMetaReducers(mergedReducers, metaReducers());
  });
  const state = computed(() => {
    const currentState = stateResult();

    if (currentState === undefined) {
      return initialState();
    }

    return currentState;
  });

  dispatcher
    .asObservable()
    .pipe(
      tap((event) => {
        const currentState = state();
        const reducerFn = reduxedReducer();
        const nextState = reducerFn(currentState, event);

        stateResult.set(nextState);
      }),
      destroyRef ? takeUntilDestroyed(destroyRef) : (x) => x
    )
    .subscribe(eventSink);

  return {
    initialState,
    state,
    reducers,
    metaReducers,
    dispatcher,
    events,
  };
}
