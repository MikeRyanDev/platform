import { ObservableInput, from, merge } from 'rxjs';
import {
  ProtectedSignalStore,
  SignalStoreFeature,
  SignalStoreFeatureResult,
} from './signal-store-models';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { toProtectedSignalStore } from './inner-signal-store';

export function withEffects<Input extends SignalStoreFeatureResult>(
  effectsFactory: (
    store: ProtectedSignalStore<
      Input['state'],
      Input['computed'],
      Input['methods'],
      Input['events']
    >
  ) => {
    [key: string]: ObservableInput<any>;
  }
): SignalStoreFeature<Input, Input> {
  return (store) => {
    const reflectedStore = toProtectedSignalStore(store);
    const sources = Object.values(effectsFactory(reflectedStore)).map(
      (effect) => from(effect)
    );

    merge(...sources)
      .pipe(takeUntilDestroyed())
      .subscribe();

    return store;
  };
}
