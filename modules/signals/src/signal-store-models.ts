import { Signal, WritableSignal } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { DeepSignal } from './deep-signal';
import { IsKnownRecord, Prettify } from './ts-helpers';

export const STATE_SOURCE = Symbol('REACTIVE_STATE');

export interface StateSource<State> {
  [STATE_SOURCE]: StateEngine<State>;
}

export interface StateEngine<State> {
  initialState: WritableSignal<State>;
  state: Signal<State>;
  reducers: WritableSignal<ReduxedReducerFn<State>[]>;
  metaReducers: WritableSignal<MetaReducerFn<State>[]>;
  dispatcher: Subject<any>;
  events: Observable<any>;
}

export type StateUpdate<State> =
  | Partial<State>
  | ((state: State) => Partial<State>);

export interface PatchStateCommand<State> {
  type: '@@patch-state';
  updaters: StateUpdate<State>[];
}

export interface InitCommand {
  type: '@@init';
}

export type SignalStoreConfig = { providedIn: 'root' };

export type StateSignals<State> = IsKnownRecord<Prettify<State>> extends true
  ? {
      [Key in keyof State]: IsKnownRecord<State[Key]> extends true
        ? DeepSignal<State[Key]>
        : Signal<State[Key]>;
    }
  : {};

export type SignalStoreProps<FeatureResult extends SignalStoreFeatureResult> =
  Prettify<
    StateSignals<FeatureResult['state']> &
      FeatureResult['computed'] &
      FeatureResult['methods']
  >;

export type SignalsDictionary = Record<string, Signal<unknown>>;

export type MethodsDictionary = Record<string, Function>;

export type EventsDictionary = Record<string, (...args: any[]) => any>;

export type ReducerFn<State extends object, Events> = (
  state: State,
  event: Events
) => StateChangeResult<State>;

export type EventInstances<T extends EventsDictionary> = {
  [Key in keyof T]: T[Key] extends (...args: any[]) => infer Result
    ? { type: Key; payload: Result }
    : never;
}[keyof T];

export type EventsReducerFn<
  State extends object,
  Events extends EventsDictionary
> = ReducerFn<State, EventInstances<Events>>;

export type ReduxedReducerFn<State, Actions = unknown> = (
  state: State | undefined,
  event: Actions
) => State;

export type MetaReducerFn<State, Events = unknown> = (
  reducer: ReduxedReducerFn<State, Events>
) => ReduxedReducerFn<State, Events>;

export type SignalStoreHooks = {
  onInit?: () => void;
  onDestroy?: () => void;
};

export type StateChangeResult<State> =
  | State
  | ((state: State) => State)
  | ((state: State) => State)[];

export type InnerSignalStore<
  State extends object = object,
  ComputedSignals extends SignalsDictionary = SignalsDictionary,
  Methods extends MethodsDictionary = MethodsDictionary,
  Events extends EventsDictionary = EventsDictionary
> = {
  stateSignals: StateSignals<State>;
  computedSignals: ComputedSignals;
  methods: Methods;
  events: Events;
  hooks: SignalStoreHooks;
} & StateSource<unknown>;

export type ProtectedSignalStore<
  State extends object,
  ComputedSignals extends SignalsDictionary,
  Methods extends MethodsDictionary,
  Events extends EventsDictionary
> = Prettify<
  StateSignals<State> &
    ComputedSignals &
    Methods & {
      emit: <T extends keyof Events>(
        event: T,
        ...args: Parameters<Events[T]>
      ) => void;
      on: <T extends keyof Events>(
        event: T
      ) => Observable<Extract<EventInstances<Events>, { type: T }>>;
    }
> &
  StateSource<State>;

export type SignalStoreFeatureResult = {
  state: object;
  computed: SignalsDictionary;
  methods: MethodsDictionary;
  events: EventsDictionary;
};

export type EmptyFeatureResult = {
  state: {};
  computed: {};
  methods: {};
  events: {};
};

export type SignalStoreFeature<
  Input extends SignalStoreFeatureResult = SignalStoreFeatureResult,
  Output extends SignalStoreFeatureResult = SignalStoreFeatureResult
> = (
  store: InnerSignalStore<
    Input['state'],
    Input['computed'],
    Input['methods'],
    Input['events']
  >
) => InnerSignalStore<
  Output['state'],
  Output['computed'],
  Output['methods'],
  Output['events']
>;

export type MergeFeatureResults<
  FeatureResults extends SignalStoreFeatureResult[]
> = FeatureResults extends []
  ? EmptyFeatureResult
  : FeatureResults extends [infer First extends SignalStoreFeatureResult]
  ? First
  : FeatureResults extends [
      infer First extends SignalStoreFeatureResult,
      infer Second extends SignalStoreFeatureResult
    ]
  ? MergeTwoFeatureResults<First, Second>
  : FeatureResults extends [
      infer First extends SignalStoreFeatureResult,
      infer Second extends SignalStoreFeatureResult,
      ...infer Rest extends SignalStoreFeatureResult[]
    ]
  ? MergeFeatureResults<[MergeTwoFeatureResults<First, Second>, ...Rest]>
  : never;

type FeatureResultKeys<FeatureResult extends SignalStoreFeatureResult> =
  | keyof FeatureResult['state']
  | keyof FeatureResult['computed']
  | keyof FeatureResult['methods']
  | keyof FeatureResult['events'];

type MergeTwoFeatureResults<
  First extends SignalStoreFeatureResult,
  Second extends SignalStoreFeatureResult
> = {
  state: Omit<First['state'], FeatureResultKeys<Second>>;
  computed: Omit<First['computed'], FeatureResultKeys<Second>>;
  methods: Omit<First['methods'], FeatureResultKeys<Second>>;
  events: Omit<First['events'], FeatureResultKeys<Second>>;
} & Second;
