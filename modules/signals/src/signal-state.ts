import { InitCommand, STATE_SOURCE, StateSource } from './signal-store-models';
import { DeepSignal, toDeepSignal } from './deep-signal';
import { createStateEngine } from './state-engine';

type SignalState<State extends object> = DeepSignal<State> & StateSource<State>;

export function signalState<State extends object>(
  initialState: State
): SignalState<State> {
  const reactiveState = createStateEngine(initialState);
  const deepSignal = toDeepSignal(reactiveState.state);
  const init: InitCommand = { type: '@@init' };

  reactiveState.dispatcher.next(init);
  Object.defineProperty(deepSignal, STATE_SOURCE, {
    value: reactiveState,
  });

  return deepSignal as SignalState<State>;
}
