import type { HashValue, ObjectLiteral } from './types';



class HashRecord<T extends ObjectLiteral>{
    private readonly _hash: HashValue;
    private _values: T;

    constructor(hash: HashValue, values: T = {} as T) {
        this._hash = hash;
        this._values = values;
    }


    public get hash(): HashValue {
        return this._hash;
    }

    is(hash: HashValue) {
        return this.hash === hash;
    }

    getValues(): T {
        return this._values;
    }

    update(newValues: Partial<T>) {
        for (const key in newValues) {
            if (Object.prototype.hasOwnProperty.call(newValues, key)) {
                const element = newValues[key];
                if (element)
                    this._values[key] = element;
            }
        }
    }
    updateFromRecord(record: HashRecord<T>) {
        const values = record.getValues();
        for (const key in values) {
            if (Object.prototype.hasOwnProperty.call(values, key)) {
                const element = values[key];
                if (element)
                    this._values[key] = element;
            }
        }
    }
};

export { HashRecord };
