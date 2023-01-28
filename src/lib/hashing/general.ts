import { writable, type Writable } from 'svelte/store';
import type { Immutable, ObjectLiteral, OmitKeys, Values } from '$lib/utils/types';
import { logAsJson, objectKeys } from '$lib/utils/funtions';
import { Err, Ok, type Result } from 'ts-results';


// export type HashValue = {
//     hash: number,
//     equals(hash: number): boolean,
// };

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

export const InsertError = {
    alreadyExists: 'ALREADY_EXISTS',
    isFull: 'IS_FULL',
} as const;
export const SearchError = {
    notExists: 'NOT_EXISTS',
} as const;
export const RemoveError = {
    notExists: 'NOT_EXISTS',
    isEmpty: 'IS_EMPTY',
} as const;
export const UpdateError = {
    notExists: 'NOT_EXISTS',
} as const;
export const OperationError = { ...InsertError, ...SearchError, ...UpdateError, ...RemoveError } as const;

export interface BasicOperations {
    insert(...args: any[]): any;
    search(...args: any[]): any;
    update(...args: any[]): any;
    remove(...args: any[]): any;
    toString?(): string;
}

type FilledTupleInitilization<T> = {
    length: number,
    value: T[],
    factory?: (index: number, prev?: T) => T;
} | {
    length: number,
    value?: T[];
    factory: (index: number, prev?: T) => T;
};

// type Identity = {
//     get identity(): number;
// };

// interface Identity<T extends { readonly identity: number; } = { readonly identity: number; }> {
//     get identity(): number;
//     is(otherIdentity: T): boolean;
//     compare(otherIdentity: T): boolean;
// }

type BaseIdentity = { readonly identity: number; };

class Identity<T extends BaseIdentity = BaseIdentity> {
    base:number
    readonly identity: number;
    constructor(base:number, identity: number) {
        this.base = base
        this.identity = identity;
    }
    is(otherIdentity: T): boolean {
        return this.identity === otherIdentity.identity;
    }
    compare(otherIdentity: T): -1 | 0 | 1 {
        return this.identity < otherIdentity.identity ? -1 :
            this.identity === otherIdentity.identity ? 0 :
                1;
    }
}

type IdentityTrait<T extends Identity = Identity> = {
    readonly identity: T;
};

type TupleItemTrait<I extends Identity, T extends TupleItemTrait<I, T>> = IdentityTrait<I> & {
    isGarbage(): boolean;
    setAsGarbage(): void;
    isItem(otherIdentity: I): boolean;
    compareItem(otherIdentity: I): -1 | 0 | 1;
    updateFromItem(otherItem: T): T;
};


class FilledTuple<T extends TupleItemTrait<I, T>, I extends Identity = Identity> implements BasicOperations {
    #items: T[];
    readonly #maxSize: number;
    #size: number;

    constructor({ length, value, factory }: FilledTupleInitilization<T>) {
        this.#maxSize = length;
        this.#size = 0;
        if (value)
            this.#items = value;
        else {
            this.#items = new Array<T>(length);
            let prev = undefined;
            for (let i = 0; i < length; ++i)
                prev = this.#items[i] = factory!(i, prev);
            // {
            //     const newVal = factory(i, prev);
            //     this.#items[i] = newVal;
            //     prev = newVal
            // };
        }
    }

    get isFull(): boolean {
        return this.#size === this.#maxSize;
    }
    get isEmpty(): boolean {
        return this.#size === this.#maxSize;
    }
    get items(): T[] {
        return this.#items;
    }

    #find(identity: I): [-1, undefined] | [Exclude<number, -1>, T] {
        let start = 0;
        let end = this.#items.length - 1;
        while (start <= end) {
            const center = Math.floor((start + end) / 2);
            if (this.#items[center].isItem(identity)) {
                return [center, this.#items[center]];
            } else if (this.#items[center]) {
                start = center + 1;
            } else {
                end = center - 1;
            }
        }
        return [-1, undefined];
    }

    insert(value: T): Result<true, Values<typeof InsertError>> {
        if (this.isFull) return new Err(InsertError.isFull);
        let index = 0;
        let result = this.#items[index].compareItem(value.identity);
        while (result < 0) {
            index += 1;
            result = this.#items[index].compareItem(value.identity);
        }
        console.log(result)
        if (result === 0)
            return new Err(InsertError.alreadyExists);
        for (let i = this.#size; i > index; i--)
            this.#items[i].updateFromItem(this.#items[i - 1]);
        this.#items[index].updateFromItem(value);
        this.#size += 1;
        return new Ok(true);
    }

    search(identity: I): Result<[number, T], typeof SearchError.notExists> {
        // let start = 0;
        // let end = this.#items.length - 1;
        // while (start <= end) {
        //     const center = Math.floor((start + end) / 2);
        //     if (this.#items[center].is(identity)) {
        //         return new Ok([center, this.#items[center]]);
        //     } else if (this.#items[center]) {
        //         start = center + 1;
        //     } else {
        //         end = center - 1;
        //     }
        // }
        // return new Err(SearchError.notExists);
        const [index, item] = this.#find(identity);
        if (index < 0) return new Err(SearchError.notExists);

        return new Ok([index, item!]);
    }

    update(identity: I, newValue: T): Result<true, Values<typeof UpdateError>> {
        const [index, item] = this.#find(identity);
        if (index < 0) return new Err(UpdateError.notExists);

        item!.updateFromItem(newValue);
        return new Ok(true);
    }

    remove(identity: I): Result<true, Values<typeof RemoveError>> {
        if (this.isEmpty) return new Err(RemoveError.isEmpty);

        const [index, _] = this.#find(identity);
        if (index === -1) return new Err(RemoveError.notExists);

        this.#size -= 1;
        for (let i = index; i < this.#size; i++) {
            this.#items[i].updateFromItem(this.#items[i + 1]);
        }

        this.#items[this.#size].setAsGarbage();
        return new Ok(true);
    }

    forEach(callback: (item: T) => void): void {
        this.#items.forEach(callback);
    }

    reset(): void {
        for (let i = 0; i < this.#maxSize; i++)
            // @ts-ignore
            this.#items[i]?.reset();
    }
    toString(): string {
        return (
            `${this.#maxSize}\n` +
            `${this.#size}\n` +
            `${this.#items.map(i => i.toString()).join('\n')}`
        );
    }
}

export { Identity };
export type { TupleItemTrait };
export type { FilledTupleInitilization };
export { FilledTuple };
