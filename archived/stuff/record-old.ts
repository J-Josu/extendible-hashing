import { writable, type Writable } from 'svelte/store';
import type { HashValue, ObjectLiteral } from '../types/hashing';


const createRecordStore = <T>(initialValue: T) => {
    const { set, subscribe, update } = writable<T>(initialValue);



    return {
        set,
        subscribe,
        update
    };
};

class HashRecord<T extends ObjectLiteral> implements Writable<T>{
    readonly #hash: HashValue;
    #values: T;
    set: Writable<T>["set"];
    update: Writable<T>["update"];
    subscribe: Writable<T>["subscribe"];

    constructor(hash: HashValue, values: T = {} as T) {
        this.#hash = hash;
        this.#values = values;
        const { set, subscribe, update } = writable<T>(values);
        this.set = set;
        this.subscribe = subscribe;
        this.update = update;
    }


    public get hash(): HashValue {
        return this.#hash;
    }

    is(hash: HashValue) {
        return this.hash === hash;
    }

    getValues(): T {
        return this.#values;
    }

    updateValue(newValues: Partial<T>) {
        this.update(
            (value: T) => {
                for (const key in newValues) {
                    if (Object.prototype.hasOwnProperty.call(newValues, key)) {
                        const element = newValues[key];
                        if (element)
                            value[key] = element;
                    }
                }
                return value;
            }
        );
    }

    updateValueFromRecord(record: HashRecord<T>) {
        const values = record.getValues();
        for (const key in values) {
            if (Object.prototype.hasOwnProperty.call(values, key)) {
                const element = values[key];
                if (element)
                    this.#values[key] = element;
            }
        }
    }


};

export { HashRecord };
