import { get, writable, type Writable } from 'svelte/store';

export const logAsJson = (value: any) => console.log(JSON.stringify(value, null, 2));

export type ValuedWritableOld<T> = {
    set: Writable<T>["set"];
    update: Writable<T>["update"];
    subscribe: Writable<T>["subscribe"];
    readonly value: T;
};

export function valuedWritableOld<T>(value: T): ValuedWritableOld<T> {
    return {
        ...writable(value),
        value
    };
}

export function valuedWritable<T>(value: T): [Writable<T>, T] {
    return [
        writable(value),
        value
    ];
}
