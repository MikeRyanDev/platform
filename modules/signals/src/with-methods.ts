import { excludeKeys } from './helpers';
import {
  EmptyFeatureResult,
  InnerSignalStore,
  MethodsDictionary,
  ProtectedSignalStore,
  SignalsDictionary,
  SignalStoreFeature,
  SignalStoreFeatureResult,
} from './signal-store-models';
import { toProtectedSignalStore } from './inner-signal-store';

export function withMethods<
  Input extends SignalStoreFeatureResult,
  Methods extends MethodsDictionary
>(
  methodsFactory: (
    store: ProtectedSignalStore<
      Input['state'],
      Input['computed'],
      Input['methods'],
      Input['events']
    >
  ) => Methods
): SignalStoreFeature<Input, EmptyFeatureResult & { methods: Methods }> {
  return (store) => {
    const methods = methodsFactory(toProtectedSignalStore(store));
    const methodsKeys = Object.keys(methods);
    const stateSignals = excludeKeys(store.stateSignals, methodsKeys);
    const computedSignals = excludeKeys(store.computedSignals, methodsKeys);

    return {
      ...store,
      stateSignals,
      computedSignals,
      methods: { ...store.methods, ...methods },
    } as InnerSignalStore<Record<string, unknown>, SignalsDictionary, Methods>;
  };
}
