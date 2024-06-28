import { filter } from 'rxjs';
import {
  EventsDictionary,
  InnerSignalStore,
  MethodsDictionary,
  ProtectedSignalStore,
  STATE_SOURCE,
  SignalsDictionary,
  StateEngine,
} from './signal-store-models';

export function toProtectedSignalStore<
  State extends object,
  Computed extends SignalsDictionary,
  Methods extends MethodsDictionary,
  Events extends EventsDictionary
>(
  innerSignalStore: InnerSignalStore<State, Computed, Methods, Events>
): ProtectedSignalStore<State, Computed, Methods, Events> {
  const dispatcher = innerSignalStore[STATE_SOURCE].dispatcher;
  const events$ = innerSignalStore[STATE_SOURCE].events;

  const emit = ((eventName: string, ...args: any[]) => {
    const factory = innerSignalStore.events[eventName];

    if (!factory) {
      throw new Error(`Event ${eventName} is not defined`);
    }

    const payload = factory(...args);
    const event = { type: eventName, payload };

    dispatcher.next(event);
  }) as ProtectedSignalStore<State, Computed, Methods, Events>['emit'];

  const on = ((eventName: string) => {
    if (!(eventName in innerSignalStore.events)) {
      throw new Error(`Event ${eventName} is not defined`);
    }

    return events$.pipe(filter((event) => event.type === eventName));
  }) as ProtectedSignalStore<State, Computed, Methods, Events>['on'];

  return {
    [STATE_SOURCE]: innerSignalStore[STATE_SOURCE] as StateEngine<State>,
    ...innerSignalStore.stateSignals,
    ...innerSignalStore.computedSignals,
    ...innerSignalStore.methods,
    emit,
    on,
  };
}
