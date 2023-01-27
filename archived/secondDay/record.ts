import type { Writable } from 'svelte/store';
import type { HashValue, ObjectLiteral } from '../types/hashing';
import BaseWritable from './baseWritable';

// implement data property to store information and separate it from state managment

type RecordState<T extends ObjectLiteral> = T & {
    readonly hash: HashValue;
};


class HashRecordOld<T extends ObjectLiteral> extends BaseWritable<RecordState<T>>{
    constructor(hash: HashValue, initialValue: T = {} as T) {
        super({
            ...initialValue,
            hash
        } satisfies RecordState<T>);
    }


    get values(): T {
        return this.getValue();
    }

    is(hash: HashValue) {
        return this.getValue().hash === hash;
    }

    updateValue(newValues: Partial<T>) {
        this.update(
            (value: T) => {
                for (const key in newValues) {
                    if (Object.prototype.hasOwnProperty.call(newValues, key)) {
                        value[key] = newValues[key] ?? value[key];
                    }
                }
                return value;
            }
        );
    }

    updateValueFrom(record: HashRecord<T>) {
        this.updateValue(record.values);
    }
};

export { HashRecord };

type RecordTemplate<T extends ObjectLiteral> = {
    hash: HashValue,
    data: Writable<T>
}


class HashRecord<T extends ObjectLiteral> {
    readonly state: {
        readonly hash: HashValue
    }
    readonly data: T;
    constructor(hash: HashValue, initialValue: T | null = null) {
        this.state = {
            hash: hash
        }
        this.data = initialValue ?? {} as T
    }


    setVal(val:number) {
        this.state.hash = val;
    }
    get values(): T {
        return this.getValue();
    }

    is(hash: HashValue) {
        return this.getValue().hash === hash;
    }

    updateValue(newValues: Partial<T>) {
        this.update(
            (value: T) => {
                for (const key in newValues) {
                    if (Object.prototype.hasOwnProperty.call(newValues, key)) {
                        value[key] = newValues[key] ?? value[key];
                    }
                }
                return value;
            }
        );
    }

    updateValueFrom(record: HashRecord<T>) {
        this.updateValue(record.values);
    }
};


export type RecordData = {
    hash: HashValue,
    fields: ObjectLiteral
}
