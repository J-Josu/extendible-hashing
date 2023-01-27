import { get, writable, type Writable } from 'svelte/store';

class BaseWritable<T> implements Writable<T>{
    set: Writable<T>["set"];
    update: Writable<T>["update"];
    subscribe: Writable<T>["subscribe"];
    protected getValue: () => T;

    constructor(initialValue: T) {
        const { set, subscribe, update } = writable<T>(initialValue);
        this.set = set;
        this.update = update;
        this.subscribe = subscribe;
        this.getValue = () => get({ subscribe });
    }
}

export default BaseWritable;
