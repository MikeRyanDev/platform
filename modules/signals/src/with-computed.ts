import { excludeKeys } from './helpers';
import { toProtectedSignalStore } from './inner-signal-store';
import {
  EmptyFeatureResult,
  ProtectedSignalStore,
  SignalsDictionary,
  SignalStoreFeature,
  SignalStoreFeatureResult,
} from './signal-store-models';

export function withComputed<
  Input extends SignalStoreFeatureResult,
  ComputedSignals extends SignalsDictionary
>(
  signalsFactory: (
    store: ProtectedSignalStore<
      Input['state'],
      Input['computed'],
      Input['methods'],
      Input['events']
    >
  ) => ComputedSignals
): SignalStoreFeature<
  Input,
  EmptyFeatureResult & { computed: ComputedSignals }
> {
  return (store) => {
    const computedSignals = signalsFactory(toProtectedSignalStore(store));
    const computedSignalsKeys = Object.keys(computedSignals);
    const stateSignals = excludeKeys(store.stateSignals, computedSignalsKeys);
    const methods = excludeKeys(store.methods, computedSignalsKeys);

    return {
      ...store,
      stateSignals,
      computedSignals: { ...store.computedSignals, ...computedSignals },
      methods,
    };
  };
}
