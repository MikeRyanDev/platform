import { STATE_SOURCE, StateSource } from './signal-store-models';

export function getState<State extends object>(
  stateSignal: StateSource<State>
): State {
  return stateSignal[STATE_SOURCE].state();
}
