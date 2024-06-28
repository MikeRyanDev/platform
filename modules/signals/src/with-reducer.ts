import { toReduxedReducer } from './reducer-helpers';
import {
  EventsReducerFn,
  SignalStoreFeature,
  SignalStoreFeatureResult,
  STATE_SOURCE,
  MetaReducerFn,
  ReduxedReducerFn,
  EventInstances,
} from './signal-store-models';
import { Prettify } from './ts-helpers';

export function withReducer<
  Input extends SignalStoreFeatureResult,
  Reducer extends EventsReducerFn<Input['state'], Input['events']>
>(reducer: Reducer): SignalStoreFeature<Input, Input> {
  return (store) => {
    const initialState = store[STATE_SOURCE].initialState();

    store[STATE_SOURCE].reducers.update((reducers) => {
      return [
        ...reducers,
        toReduxedReducer(
          initialState as Input['state'],
          reducer
        ) as ReduxedReducerFn<unknown>,
      ];
    });

    return store;
  };
}

export function withMetaReducer<Input extends SignalStoreFeatureResult>(
  metaReducer: MetaReducerFn<
    Prettify<Input['state']>,
    Prettify<EventInstances<Input['events']>>
  >
): SignalStoreFeature<Input, Input> {
  return (store) => {
    store[STATE_SOURCE].metaReducers.update((metaReducers) => {
      return [...metaReducers, metaReducer as MetaReducerFn<unknown>];
    });

    return store;
  };
}
