export type Values<T> = T[keyof T];

export type ObjectLiteral = Record<string, any>;

// type base<T extends { val?: never;[K: PropertyKey]: unknown; }> = { val: number; } & T;
export type OmitKeys<T extends object> = { [P in keyof T]?: never } & { [K: PropertyKey]: unknown; }

type ImmutablePrimitive = undefined | null | boolean | string | number | Function;
export type Immutable<T> =
    T extends ImmutablePrimitive ? T :
    T extends Array<infer U> ? ImmutableArray<U> :
    T extends Map<infer K, infer V> ? ImmutableMap<K, V> :
    T extends Set<infer M> ? ImmutableSet<M> :
    ImmutableObject<T>;
export type ImmutableArray<T> = ReadonlyArray<Immutable<T>>;
export type ImmutableMap<K, V> = ReadonlyMap<Immutable<K>, Immutable<V>>;
export type ImmutableSet<T> = ReadonlySet<Immutable<T>>;
export type ImmutableObject<T> = { readonly [K in keyof T]: Immutable<T[K]> };
