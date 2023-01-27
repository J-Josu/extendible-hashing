import { Err, Ok, Result } from 'ts-results';
import type { HashRecord } from './record';
import { InsertError, OperationError, RemoveError, UpdateError, type Values } from '$lib/logic/types';
import type { HashValue, ObjectLiteral } from '$lib/types/hashing';
import { valuedWritable } from './utils';
import type { Writable } from 'svelte/store';


export type BucketState = {
    depth: number,
    readonly maxSise: number;
    readonly id: number;
};

export type BucketStateStore = Writable<BucketState>;

type BucketValues<T extends ObjectLiteral> = Map<HashValue, HashRecord<T>>;

export type BucketData<T extends ObjectLiteral> = BucketValues<T>;

export type BucketDataStore<T extends ObjectLiteral = ObjectLiteral> = Writable<BucketData<T>>;

class HashBucket<T extends ObjectLiteral>{
    #state: BucketState;
    state: BucketStateStore;
    #data: BucketData<T>;
    data: BucketDataStore<T>;

    constructor(depth: number, size: number, id: number) {
        const [stateStore, stateRef] = valuedWritable({
            depth,
            maxSise: size,
            id
        });
        this.#state = stateRef;
        this.state = stateStore;
        // let count = 0;
        // const placeHolders = new Array(size).fill(new HashRecord(count++, { val1: 1, val2: 2 }));
        // const [dataStore, dataRef] = valuedWritable(new Map<HashValue, HashRecord<T>>(placeHolders.map((value, i) => [i, value])));
        const [dataStore, dataRef] = valuedWritable(new Map<HashValue, HashRecord<T>>());
        this.#data = dataRef;
        this.data = dataStore;
    }

    public get id(): number {
        return this.#state.id;
    }
    public get isFull(): boolean {
        return this.#data.size === this.#state.maxSise;
    }
    public get isEmpty(): boolean {
        return this.#data.size === 0;
    }
    public get depth(): number {
        return this.#state.depth;
    }

    public increaseDepth(): number {
        this.#state.depth += 1;
        return this.#state.depth;
    }
    public decreaseDepth(): number {
        this.#state.depth -= 1;
        return this.#state.depth;
    }

    public insert(hash: HashValue, record: HashRecord<T>): Result<true, Values<typeof InsertError>> {
        if (this.#data.has(hash))
            return new Err(InsertError.alreadyExists);
        if (this.isFull)
            return new Err(InsertError.isFull);
        this.#data.set(hash, record);
        return new Ok(true);
    }

    public remove(hash: HashValue): Result<true, Values<typeof RemoveError>> {
        if (this.#data.delete(hash))
            return new Ok(true);
        return new Err(RemoveError.notExists);
    }

    public update(hash: HashValue, record: HashRecord<T>): Result<true, Values<typeof UpdateError>> {
        const old_record = this.#data.get(hash);
        if (!old_record)
            return new Err(UpdateError.notExists);
        old_record.updateDataFrom(record);
        return new Ok(true);
    }

    public search(hash: HashValue): Result<HashRecord<T>, typeof OperationError.notExists> {
        const value = this.#data.get(hash);
        if (!value)
            return new Err(OperationError.notExists);
        return new Ok(value);
    }

    public copyValues(): Map<HashValue, HashRecord<T>> {
        return new Map(this.#data.entries());
    }

    public clear(): void {
        this.#data.clear();
    }

    public log(): void {
        console.dir(this.#data);
    }
};

export { HashBucket };


        // this.state = valuedWritable({
        //     depth,
        //     maxSise: size,
        //     id
        // })
        // this.data = valuedWritable(new Map<HashValue, HashRecord<T>>());
