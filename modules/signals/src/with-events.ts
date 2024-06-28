import {
  EventsDictionary,
  SignalStoreFeature,
  SignalStoreFeatureResult,
} from './signal-store-models';

export function withEvents<
  Input extends SignalStoreFeatureResult,
  Events extends EventsDictionary
>(events: Events): SignalStoreFeature<Input, Input & { events: Events }> {
  return (store) => {
    return {
      ...store,
      events: {
        ...store.events,
        ...events,
      },
    } as any;
  };
}
