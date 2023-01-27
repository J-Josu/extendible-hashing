import type { HashValue, ObjectLiteral } from './types';



class HashRecord<T extends ObjectLiteral>{
    private readonly _hash: HashValue;
    private values: T;

    constructor(hash: HashValue, values: T = {} as T) {
        this._hash = hash;
        this.values = values;
    }


    public get hash(): HashValue {
        return this._hash;
    }

    is(hash: HashValue) {
        return this.hash === hash;
    }

    getValues(): T {
        return this.values;
    }

    update(newValues: Partial<T>) {
        for (const key in newValues) {
            if (Object.prototype.hasOwnProperty.call(newValues, key)) {
                const element = newValues[key];
                if (element)
                    this.values[key] = element;
            }
        }
    }
};

export { HashRecord };