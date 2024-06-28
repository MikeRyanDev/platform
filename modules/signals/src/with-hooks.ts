import {
  EmptyFeatureResult,
  ProtectedSignalStore,
  SignalStoreFeature,
  SignalStoreFeatureResult,
} from './signal-store-models';
import { toProtectedSignalStore } from './inner-signal-store';

type HookFn<Input extends SignalStoreFeatureResult> = (
  store: ProtectedSignalStore<
    Input['state'],
    Input['computed'],
    Input['methods'],
    Input['events']
  >
) => void;

type HooksFactory<Input extends SignalStoreFeatureResult> = (
  store: ProtectedSignalStore<
    Input['state'],
    Input['computed'],
    Input['methods'],
    Input['events']
  >
) => {
  onInit?: () => void;
  onDestroy?: () => void;
};

export function withHooks<Input extends SignalStoreFeatureResult>(hooks: {
  onInit?: HookFn<Input>;
  onDestroy?: HookFn<Input>;
}): SignalStoreFeature<Input, EmptyFeatureResult>;
export function withHooks<Input extends SignalStoreFeatureResult>(
  hooks: HooksFactory<Input>
): SignalStoreFeature<Input, EmptyFeatureResult>;

export function withHooks<Input extends SignalStoreFeatureResult>(
  hooksOrFactory:
    | {
        onInit?: HookFn<Input>;
        onDestroy?: HookFn<Input>;
      }
    | HooksFactory<Input>
): SignalStoreFeature<Input, EmptyFeatureResult> {
  return (store) => {
    const reflectedStore = toProtectedSignalStore(store);
    const hooks =
      typeof hooksOrFactory === 'function'
        ? hooksOrFactory(reflectedStore)
        : hooksOrFactory;
    const createHook = (name: keyof typeof hooks) => {
      const hook = hooks[name];
      const currentHook = store.hooks[name];

      return hook
        ? () => {
            if (currentHook) {
              currentHook();
            }

            hook(reflectedStore);
          }
        : currentHook;
    };

    return {
      ...store,
      hooks: {
        onInit: createHook('onInit'),
        onDestroy: createHook('onDestroy'),
      },
    };
  };
}
