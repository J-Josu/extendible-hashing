import { get, writable, type Writable } from 'svelte/store';
import type { Immutable, OmitKeys } from '$lib/utils/types';
import { objectKeys } from '$lib/utils/funtions';


export type HashValue = number;

type BaseInstanceState = {
    readonly id: number,
    isNew: boolean,
};

export type InstanceState<T extends OmitKeys<BaseInstanceState>> = BaseInstanceState & T;


export class ValuedWritable<T> {
    // set: Writable<T>["set"];
    update: Writable<T>["update"];
    subscribe: Writable<T>["subscribe"];
    readonly value: T;

    constructor(value: T) {
        const store = writable<T>(value);
        this.subscribe = store.subscribe;
        // this.set = store.set;
        this.update = store.update;
        this.value = get(store);
    }

    set(value: Partial<T>) {

    }
    notifyUpdate(): void {
        this.update((value) => value);
    }
}
export class WritableWrapper<T extends object> {
    // set: Writable<T>["set"];
    readonly asStore: Writable<T>;
    // update: Writable<T>["update"];
    // subscribe: Writable<T>["subscribe"];
    // readonly value: T;

    constructor(value: T) {
        this.asStore = writable<T>(value);
        // this.subscribe = store.subscribe;
        // this.set = store.set;
        // this.update = store.update;
        // this.value = get(store);
    }

    get(): T {
        return get(this.asStore);
    }

    set(value: Partial<T>): T {
        let newVal: T;
        this.asStore.update(crrValue => {
            newVal = { ...crrValue, ...value };
            return newVal;
        });
        return newVal!;
        // this.asStore.update(crrValue => ({ ...crrValue, ...value }));
        // this.store.set({...get(this.store),...value})
    }
}


type SincronizedStateTrait<T> = {
    get value(): Immutable<T>;
    set(newValue: Partial<T>): Immutable<T>;
};

type SincronizedState<T, FrameworkSpecific = undefined> =
    FrameworkSpecific extends undefined ? SincronizedStateTrait<T> :
    SincronizedState<T> & FrameworkSpecific;

type SvelteSpecific<T> = {
    readonly asStore: Writable<T>;
};

export function sincronizedStateSvelte<T>(initialValue: T): SincronizedState<T, SvelteSpecific<T>> {
    let _value = initialValue;
    const store = writable<T>(_value);

    return {
        get value() {
            return _value as Immutable<T>;
        },
        set(newValue: Partial<T>): Immutable<T> {
            // objectKeys(newValue).forEach(key => _value[key] = newValue[key]!);
            _value = { ..._value, ...newValue };
            store.set(_value);
            return _value as Immutable<T>;
        },
        asStore: store
    };
}

// class StoreFactory<T> implements {
//     readonly asStore: Writable<T>;
//     constructor(value: T) {

//     }
//     get value(): Immutable<T> {

//     }
//     set(newValue: Partial<T>): Immutable<T> {

//     }
// }

const hola = {} as any as SincronizedState<{ pedro: string; }>;
const chau = {} as any as SincronizedState<{ pedro: string; }, { asStore: { set: () => void, subscribe: () => void, update: () => void; }; }>;
chau;
class Lucho<T> {
    _value: T;
    $: Writable<T>;
    constructor(val: T) {
        this._value = val;
        this.$ = writable(val);
    }

    get value(): Immutable<T> {
        return this.value as Immutable<T>;
    };

    set(newValue: Partial<T>) {
        this._value = { ...this._value, ...newValue };
        this.$.set(this._value);
    }
};

function lucho2<T extends object>(val: T): { set: (value: Partial<T>) => any; } {
    let state = { ...val };
    return {

    };
}
const t = {} as any as Lucho<{ val: number, val2: number, val3: { text: string, id: string; }; }>;
t.value;
// t.set({val3:{id:'pedro'}})

// t.set('val3','id','pedro')

// t.set({})
// t.set(e => {e.val3.id = 'pedro'; return e})

// declare type KeyOf<T> = number extends keyof T ? 0 extends 1 & T ? keyof T : [T] extends [readonly unknown[]] ? number : [T] extends [never] ? never : keyof T : keyof T;
// // export declare namespace SolidStore {
// //     interface Unwrappable {
// //     }
// // }
// export declare type NotWrappable = string | number | bigint | symbol | boolean | Function | null | undefined;//| SolidStore.Unwrappable[keyof SolidStore.Unwrappable]
// declare type W<T> = Exclude<T, NotWrappable>;
// export declare type ArrayFilterFn<T> = (item: T, index: number) => boolean;
// export declare type PickMutable<T> = {
//     [K in keyof T as (<U>() => U extends {
//         [V in K]: T[V];
//     } ? 1 : 2) extends <U>() => U extends {
//         -readonly [V in K]: T[V];
//     } ? 1 : 2 ? K : never]: T[K];
// };
// declare type MutableKeyOf<T> = KeyOf<T> & keyof PickMutable<T>;
// export declare type CustomPartial<T> = T extends readonly unknown[] ? "0" extends keyof T ? {
//     [K in Extract<keyof T, `${number}`>]?: T[K];
// } : {
//     [x: number]: T[number];
// } : Partial<T>;
// export declare type StorePathRange = {
//     from?: number;
//     to?: number;
//     by?: number;
// };
// export declare type Part<T, K extends KeyOf<T> = KeyOf<T>> = K | ([K] extends [never] ? never : readonly K[]) | ([T] extends [readonly unknown[]] ? ArrayFilterFn<T[number]> | StorePathRange : never);
// export declare type StoreSetter<T, U extends PropertyKey[] = []> = T | CustomPartial<T> | ((prevState: T, traversed: U) => T | CustomPartial<T>);
// declare type Rest<T, U extends PropertyKey[], K extends KeyOf<T> = KeyOf<T>> = K extends keyof PickMutable<T> ? [Part<T, K>, ...RestSetterOrContinue<T[K], [K, ...U]>] : K extends KeyOf<K> ? [Part<T, K>, ...RestContinue<T[K], [K, ...U]>] : never;
// declare type RestContinue<T, U extends PropertyKey[]> = 0 extends 1 & T ? [...Part<any>[], StoreSetter<any, PropertyKey[]>] : Rest<T, U>;
// export interface SetStoreFunction<T> {
//     <K1 extends KeyOf<W<T>>, K2 extends KeyOf<W<W<T>[K1]>>, K3 extends KeyOf<W<W<W<T>[K1]>[K2]>>, K4 extends KeyOf<W<W<W<W<T>[K1]>[K2]>[K3]>>, K5 extends KeyOf<W<W<W<W<W<T>[K1]>[K2]>[K3]>[K4]>>, K6 extends KeyOf<W<W<W<W<W<W<T>[K1]>[K2]>[K3]>[K4]>[K5]>>, K7 extends MutableKeyOf<W<W<W<W<W<W<W<T>[K1]>[K2]>[K3]>[K4]>[K5]>[K6]>>>(k1: Part<W<T>, K1>, k2: Part<W<W<T>[K1]>, K2>, k3: Part<W<W<W<T>[K1]>[K2]>, K3>, k4: Part<W<W<W<W<T>[K1]>[K2]>[K3]>, K4>, k5: Part<W<W<W<W<W<T>[K1]>[K2]>[K3]>[K4]>, K5>, k6: Part<W<W<W<W<W<W<T>[K1]>[K2]>[K3]>[K4]>[K5]>, K6>, k7: Part<W<W<W<W<W<W<W<T>[K1]>[K2]>[K3]>[K4]>[K5]>[K6]>, K7>, setter: StoreSetter<W<W<W<W<W<W<W<T>[K1]>[K2]>[K3]>[K4]>[K5]>[K6]>[K7], [
//         K7,
//         K6,
//         K5,
//         K4,
//         K3,
//         K2,
//         K1
//     ]>): void;
//     <K1 extends KeyOf<W<T>>, K2 extends KeyOf<W<W<T>[K1]>>, K3 extends KeyOf<W<W<W<T>[K1]>[K2]>>, K4 extends KeyOf<W<W<W<W<T>[K1]>[K2]>[K3]>>, K5 extends KeyOf<W<W<W<W<W<T>[K1]>[K2]>[K3]>[K4]>>, K6 extends KeyOf<W<W<W<W<W<W<T>[K1]>[K2]>[K3]>[K4]>[K5]>>>(k1: Part<W<T>, K1>, k2: Part<W<W<T>[K1]>, K2>, k3: Part<W<W<W<T>[K1]>[K2]>, K3>, k4: Part<W<W<W<W<T>[K1]>[K2]>[K3]>, K4>, k5: Part<W<W<W<W<W<T>[K1]>[K2]>[K3]>[K4]>, K5>, k6: Part<W<W<W<W<W<W<T>[K1]>[K2]>[K3]>[K4]>[K5]>, K6>, setter: StoreSetter<W<W<W<W<W<W<T>[K1]>[K2]>[K3]>[K4]>[K5]>[K6], [K6, K5, K4, K3, K2, K1]>): void;
//     <K1 extends KeyOf<W<T>>, K2 extends KeyOf<W<W<T>[K1]>>, K3 extends KeyOf<W<W<W<T>[K1]>[K2]>>, K4 extends KeyOf<W<W<W<W<T>[K1]>[K2]>[K3]>>, K5 extends MutableKeyOf<W<W<W<W<W<T>[K1]>[K2]>[K3]>[K4]>>>(k1: Part<W<T>, K1>, k2: Part<W<W<T>[K1]>, K2>, k3: Part<W<W<W<T>[K1]>[K2]>, K3>, k4: Part<W<W<W<W<T>[K1]>[K2]>[K3]>, K4>, k5: Part<W<W<W<W<W<T>[K1]>[K2]>[K3]>[K4]>, K5>, setter: StoreSetter<W<W<W<W<W<T>[K1]>[K2]>[K3]>[K4]>[K5], [K5, K4, K3, K2, K1]>): void;
//     <K1 extends KeyOf<W<T>>, K2 extends KeyOf<W<W<T>[K1]>>, K3 extends KeyOf<W<W<W<T>[K1]>[K2]>>, K4 extends MutableKeyOf<W<W<W<W<T>[K1]>[K2]>[K3]>>>(k1: Part<W<T>, K1>, k2: Part<W<W<T>[K1]>, K2>, k3: Part<W<W<W<T>[K1]>[K2]>, K3>, k4: Part<W<W<W<W<T>[K1]>[K2]>[K3]>, K4>, setter: StoreSetter<W<W<W<W<T>[K1]>[K2]>[K3]>[K4], [K4, K3, K2, K1]>): void;
//     <K1 extends KeyOf<W<T>>, K2 extends KeyOf<W<W<T>[K1]>>, K3 extends MutableKeyOf<W<W<W<T>[K1]>[K2]>>>(k1: Part<W<T>, K1>, k2: Part<W<W<T>[K1]>, K2>, k3: Part<W<W<W<T>[K1]>[K2]>, K3>, setter: StoreSetter<W<W<W<T>[K1]>[K2]>[K3], [K3, K2, K1]>): void;
//     <K1 extends KeyOf<W<T>>, K2 extends MutableKeyOf<W<W<T>[K1]>>>(k1: Part<W<T>, K1>, k2: Part<W<W<T>[K1]>, K2>, setter: StoreSetter<W<W<T>[K1]>[K2], [K2, K1]>): void;
//     <K1 extends MutableKeyOf<W<T>>>(k1: Part<W<T>, K1>, setter: StoreSetter<W<T>[K1], [K1]>): void;
//     (setter: StoreSetter<T, []>): void;
//     <K1 extends KeyOf<W<T>>, K2 extends KeyOf<W<W<T>[K1]>>, K3 extends KeyOf<W<W<W<T>[K1]>[K2]>>, K4 extends KeyOf<W<W<W<W<T>[K1]>[K2]>[K3]>>, K5 extends KeyOf<W<W<W<W<W<T>[K1]>[K2]>[K3]>[K4]>>, K6 extends KeyOf<W<W<W<W<W<W<T>[K1]>[K2]>[K3]>[K4]>[K5]>>, K7 extends KeyOf<W<W<W<W<W<W<W<T>[K1]>[K2]>[K3]>[K4]>[K5]>[K6]>>>(k1: Part<W<T>, K1>, k2: Part<W<W<T>[K1]>, K2>, k3: Part<W<W<W<T>[K1]>[K2]>, K3>, k4: Part<W<W<W<W<T>[K1]>[K2]>[K3]>, K4>, k5: Part<W<W<W<W<W<T>[K1]>[K2]>[K3]>[K4]>, K5>, k6: Part<W<W<W<W<W<W<T>[K1]>[K2]>[K3]>[K4]>[K5]>, K6>, k7: Part<W<W<W<W<W<W<W<T>[K1]>[K2]>[K3]>[K4]>[K5]>[K6]>, K7>, ...rest: Rest<W<W<W<W<W<W<W<T>[K1]>[K2]>[K3]>[K4]>[K5]>[K6]>[K7], [K7, K6, K5, K4, K3, K2, K1]>): void;
// }
// /**
//  * creates a reactive store that can be read through a proxy object and written with a setter function
//  *
//  * @description https://www.solidjs.com/docs/latest/api#createstore
//  */
// export declare function createStore<T extends object = {}>(...[store, options]: {} extends T ? [store?: T | Store<T>, options?: {
//     name?: string;
// }] : [store: T | Store<T>, options?: {
//     name?: string;
// }]): [get: Store<T>, set: SetStoreFunction<T>];
// export {};

// function updatePath<T>(current:T, path, traversed:any[]?= []) {
//     let part,
//       next = current;
//     if (path.length > 1) {
//       part = path.shift();
//       const partType = typeof part,
//         isArray = Array.isArray(current);
//       if (Array.isArray(part)) {
//         for (let i = 0; i < part.length; i++) {
//           updatePath(current, [part[i]].concat(path), traversed);
//         }
//         return;
//       } else if (isArray && partType === "function") {
//         for (let i = 0; i < current.length; i++) {
//           if (part(current[i], i)) updatePath(current, [i].concat(path), traversed);
//         }
//         return;
//       } else if (isArray && partType === "object") {
//         const {
//           from = 0,
//           to = current.length - 1,
//           by = 1
//         } = part;
//         for (let i = from; i <= to; i += by) {
//           updatePath(current, [i].concat(path), traversed);
//         }
//         return;
//       } else if (path.length > 1) {
//         updatePath(current[part], path, [part].concat(traversed));
//         return;
//       }
//       next = current[part];
//       traversed = [part].concat(traversed);
//     }
//     let value = path[0];
//     if (typeof value === "function") {
//       value = value(next, traversed);
//       if (value === next) return;
//     }
//     if (part === undefined && value == undefined) return;
//     if (part === undefined || isWrappable(next) && isWrappable(value) && !Array.isArray(value)) {
//       mergeStoreNode(next, value);
//     } else setProperty(current, part, value);
//   }
//   function createStore(state) {
//     const isArray = Array.isArray(state);
//     function setStore(...args) {
//       isArray && args.length === 1 ? updateArray(state, args[0]) : updatePath(state, args);
//     }
//     return [state, setStore];
//   }
