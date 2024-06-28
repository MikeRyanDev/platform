import {
  STATE_SOURCE,
  PatchStateCommand,
  StateSource,
} from './signal-store-models';
import { Prettify } from './ts-helpers';

export type PartialStateUpdater<State extends object> = (
  state: State
) => Partial<State>;

export function patchState<State extends object>(
  stateSignal: StateSource<State>,
  ...updaters: Array<
    Partial<Prettify<State>> | PartialStateUpdater<Prettify<State>>
  >
): void {
  const command: PatchStateCommand<Prettify<State>> = {
    type: '@@patch-state',
    updaters,
  };

  stateSignal[STATE_SOURCE].dispatcher.next(command);
}
