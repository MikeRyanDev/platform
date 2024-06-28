import { computed, Signal, isSignal } from '@angular/core';
import {
  SignalStoreFeature,
  signalStoreFeature,
  withComputed,
  withState,
} from '@ngrx/signals';
import {
  EntityComputed,
  EntityId,
  EntityMap,
  EntityState,
  NamedEntityComputed,
  NamedEntityState,
} from './models';
import { getEntityStateKeys } from './helpers';

export function withEntities<Entity>(): SignalStoreFeature<
  { state: {}; computed: {}; methods: {}; events: {} },
  {
    state: EntityState<Entity>;
    computed: EntityComputed<Entity>;
    methods: {};
    events: {};
  }
>;
export function withEntities<Entity, Collection extends string>(config: {
  entity: Entity;
  collection: Collection;
}): SignalStoreFeature<
  { state: {}; computed: {}; methods: {}; events: {} },
  {
    state: NamedEntityState<Entity, Collection>;
    computed: NamedEntityComputed<Entity, Collection>;
    methods: {};
    events: {};
  }
>;
export function withEntities<Entity>(config: {
  entity: Entity;
}): SignalStoreFeature<
  { state: {}; computed: {}; methods: {}; events: {} },
  {
    state: EntityState<Entity>;
    computed: EntityComputed<Entity>;
    methods: {};
    events: {};
  }
>;
export function withEntities<Entity>(config?: {
  entity: Entity;
  collection?: string;
}): SignalStoreFeature {
  const { entityMapKey, idsKey, entitiesKey } = getEntityStateKeys(config);

  return signalStoreFeature(
    withState({
      [entityMapKey]: {},
      [idsKey]: [],
    }),
    withComputed((store) => ({
      [entitiesKey]: computed(() => {
        const entityMap = getSignal<EntityMap<Entity>>(store, entityMapKey)();
        const ids = getSignal<EntityId[]>(store, idsKey)();

        return ids.map((id) => entityMap[id]);
      }),
    }))
  );
}

function getSignal<T>(source: any, key: string): Signal<T> {
  if (key in source && isSignal(source[key])) {
    return source[key];
  }

  throw new Error(`Signal ${key} is not defined`);
}
