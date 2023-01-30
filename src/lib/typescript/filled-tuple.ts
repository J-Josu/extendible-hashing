import { InsertError, RemoveError, SearchError, UpdateError } from './errors';
import { Err, Ok, Result } from 'ts-results';
import type { Values } from './utils/types';


class Identity {
    readonly #identity: number;
    readonly baseValue?: number;
    constructor(identityValue: number, baseValue?: number) {
        if (typeof identityValue !== 'number') throw new Error(`wrond Identity initialization, identityValue='${identityValue}' must be a number`);

        this.#identity = identityValue;
        this.baseValue = baseValue;
    }
    is(otherIdentity?: Identity): boolean {
        if (!otherIdentity) return false;
        return this.#identity === otherIdentity.#identity;
    }
    compare(otherIdentity: Identity): -1 | 0 | 1 {
        return this.#identity < otherIdentity.#identity ? -1 :
            this.#identity === otherIdentity.#identity ? 0 :
                1;
    }
}

interface FilledTupleItemTrait<T extends FilledTupleItemTrait<T>> {
    isGarbage(): boolean;
    setAsGarbage(): void;
    setAsValid(): void;
    isItem(otherIdentity?: Identity): boolean;
    compareIdentity(otherIdentity?: Identity): -1 | 0 | 1;
    compareItem(otherItem: T): -1 | 0 | 1;
    setFromItem(otherItem: T): T;
};

type FilledTupleInitilization<T> = {
    length: number;
    itemFactory: (index?: number, prev?: T) => T;
    initialItems: undefined;
} | {
    itemFactory: undefined;
    length: undefined;
    initialItems: T[];
};

class FilledTuple<T extends FilledTupleItemTrait<T>> {
    #items: T[];
    readonly #maxSize: number;
    #size: number;

    constructor({ length, itemFactory, initialItems }: FilledTupleInitilization<T>) {
        if (initialItems !== undefined) {
            this.#items = [...initialItems];
            this.#maxSize = this.#items.length;
            this.#size = this.#maxSize;
        }
        else {
            this.#size = 0;
            this.#maxSize = length;
            this.#items = new Array<T>(length);
            let prev = undefined;
            for (let i = 0; i < length; ++i)
                prev = this.#items[i] = itemFactory(i, prev);
        }
    }

    get isFull(): boolean {
        return this.#size === this.#maxSize;
    }
    get isEmpty(): boolean {
        return this.#size === 0;
    }
    get items(): T[] {
        return this.#items;
    }

    #find(identity: Identity): [T, number] | [undefined, -1] {
        let start = 0;
        let end = this.#items.length - 1;
        while (start <= end) {
            const center = Math.floor((start + end) / 2);
            if (this.#items[center].isItem(identity))
                return [this.#items[center], center];

            else if (this.#items[center].compareIdentity(identity) === -1)
                start = center + 1;

            else
                end = center - 1;
        }

        return [undefined, -1];
    }

    insert(value: T): Result<true, Values<typeof InsertError>> {
        if (this.isFull) return new Err(InsertError.isFull);

        let index = 0;
        let result: number = 1;
        for (; index < this.#size; index++) {
            if (this.#items[index].isGarbage()) break;

            result = this.#items[index].compareItem(value);

            if (result !== -1) break;
        }

        if (result === 0)
            return new Err(InsertError.alreadyExists);

        // if (result === -1)
        //     index += 1;

        for (let i = this.#size; i > index; i--)
            this.#items[i].setFromItem(this.#items[i - 1]);
        this.#items[index].setFromItem(value);
        this.#size += 1;
        return new Ok(true);
    }

    find(identity: Identity): Result<[number, T], typeof SearchError.notExists> {
        const [item, index] = this.#find(identity);
        if (item === undefined) return new Err(SearchError.notExists);

        return new Ok([index, item]);
    }

    update(identity: Identity, newValue: T): Result<true, Values<typeof UpdateError>> {
        const [item, _] = this.#find(identity);
        if (item === undefined) return new Err(UpdateError.notExists);

        item.setFromItem(newValue);
        return new Ok(true);
    }

    remove(identity: Identity): Result<true, Values<typeof RemoveError>> {
        if (this.isEmpty) return new Err(RemoveError.isEmpty);

        const [_, index] = this.#find(identity);
        if (index === -1) return new Err(RemoveError.notExists);

        this.#size -= 1;
        for (let i = index; i < this.#size; i++) {
            this.#items[i].setFromItem(this.#items[i + 1]);
        }

        this.#items[this.#size].setAsGarbage();
        return new Ok(true);
    }

    forEach(callback: (item: T) => void): void {
        this.#items.forEach(callback);
    }

    clear() {
        this.#items.forEach(item => item.setAsGarbage);
        this.#size = 0;
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
export type { FilledTupleItemTrait };
export type { FilledTupleInitilization };
export { FilledTuple };
