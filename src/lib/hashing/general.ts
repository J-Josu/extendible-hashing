import { writable, type Writable } from 'svelte/store';
import type { OmitKeys } from '$lib/typescript/utils/types';


type BaseInstanceState = {
    readonly id: number,
    isNew: boolean,
};

export type InstanceState<T extends OmitKeys<BaseInstanceState>> = BaseInstanceState & T;


type BaseSincronizedState<T> = {
    get value(): T;
    set(newValue: Partial<T>): T;
    update(fn: (currentValue: T) => T): T;
};

type SincronizedStateTrait<T, FrameworkSpecificTrait = undefined> =
    FrameworkSpecificTrait extends undefined ? BaseSincronizedState<T> :
    BaseSincronizedState<T> & FrameworkSpecificTrait;

type SvelteSpecificTrait<T> = {
    readonly asStore: Writable<T>;
};

export type SincronizedState<T> = SincronizedStateTrait<T, SvelteSpecificTrait<T>>;

export function sincronizedState<T>(initialValue: T): SincronizedState<T> {
    let _state = initialValue;
    const store = writable<T>(_state);

    return {
        get value(): T {
            return _state;
        },
        set(newValue: Partial<T>): T {
            // objectKeys(newValue).forEach(key => _value[key] = newValue[key]!);
            _state = { ..._state, ...newValue };
            store.set(_state);
            return _state;
        },
        update(fn: (currentValue: T) => T): T {
            _state = fn(_state);
            store.set(_state);
            return _state;
        },
        asStore: store
    };
}

export interface BasicOperations {
    insert(...args: any[]): any;
    search(...args: any[]): any;
    update(...args: any[]): any;
    remove(...args: any[]): any;
    toString?(): string;
}
