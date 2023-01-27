import { type HashValue, type InstanceState, type SincronizedState, sincronizedState } from '$lib/hashing/general';
import { logAsJson } from '$lib/utils/funtions';
import type { ObjectLiteral, Values } from '$lib/utils/types';
import { Err, Ok, Result } from 'ts-results';
import { HashRecord } from './record';


export const InsertError = {
    alreadyExists: 'ALREADY_EXISTS',
    isFull: 'IS_FULL',
} as const;
export const RemoveError = {
    notExists: 'NOT_EXISTS',
    isEmpty: 'IS_EMPTY',
} as const;
export const UpdateError = {
    notExists: 'NOT_EXISTS',
} as const;
export const OperationError = { ...UpdateError, ...InsertError, ...RemoveError } as const;


export type BucketState = InstanceState<{
    readonly maxSise: number;
    readonly nrr: number;
    depth: number;
}>;

// TODO
class BucketStorage<T extends ObjectLiteral> {
    #buckets: HashRecord<T>[];
    readonly #size: number;

    constructor(size: number, initialValue?: HashRecord<T>[]) {
        this.#size = size;
        this.#buckets = initialValue ?? new Array<HashRecord<T>>(size).map(_ => new HashRecord<T>());
    }

    get isFull(): boolean {
        return !this.#buckets.some(record => record.isNew);
    }
    get isEmpty(): boolean {
        return this.#buckets.every(record => record.isNew);
    }

    clear(): void {
        this.#buckets.splice(0);
    }

    toString(): string {
        return `${this.#size}\n${logAsJson(this.#buckets)}`;
    }
}

type BucketValues<T extends ObjectLiteral> = Map<HashValue, HashRecord<T>>;

export type BucketData<T extends ObjectLiteral = ObjectLiteral> = BucketValues<T>;


class HashBucket<T extends ObjectLiteral>{
    private static newCount: number = 0;
    readonly state: SincronizedState<BucketState>;
    readonly data: SincronizedState<BucketData<T>>;

    constructor(depth: number, size: number, nrr?: number, initialValue?: BucketData<T>) {
        this.state = sincronizedState({
            depth,
            maxSise: size,
            id: HashBucket.newCount,
            isNew: nrr === undefined,
            nrr: nrr ?? HashBucket.newCount
        });

        // let count = 0;
        // const placeHolders = new Array(size).fill(new HashRecord(count++, { val1: 1, val2: 2 }));
        // const [dataStore, dataRef] = valuedWritable(new Map<HashValue, HashRecord<T>>(placeHolders.map((value, i) => [i, value])));
        this.data = sincronizedState(new Map<HashValue, HashRecord<T>>());

        HashBucket.newCount += 1;
    }

    static initializeBucket() {

    };

    public get id(): number {
        return this.state.value.id;
    }
    public get isFull(): boolean {
        return this.data.value.size === this.state.value.maxSise;
    }
    public get isEmpty(): boolean {
        return this.data.value.size === 0;
    }
    public get depth(): number {
        return this.state.value.depth;
    }
    public increaseDepth(): number {
        return this.state.update(state => { state.depth += 1; return state; }).depth;
    }
    public decreaseDepth(): number {
        return this.state.update(state => { state.depth -= 1; return state; }).depth;
    }

    public insert(hash: HashValue, record: HashRecord<T>): Result<true, Values<typeof InsertError>> {
        if (this.data.value.has(hash))
            return new Err(InsertError.alreadyExists);
        if (this.isFull)
            return new Err(InsertError.isFull);
        this.data.update(data => { data.set(hash, record); return data; });
        return new Ok(true);
    }

    public remove(hash: HashValue): Result<true, Values<typeof RemoveError>> {
        if (this.data.value.delete(hash))
            return new Ok(true);
        return new Err(RemoveError.notExists);
    }

    public update(hash: HashValue, record: HashRecord<T>): Result<true, Values<typeof UpdateError>> {
        const old_record = this.data.value.get(hash);
        if (!old_record)
            return new Err(UpdateError.notExists);
        old_record.updateDataFrom(record);
        return new Ok(true);
    }

    public search(hash: HashValue): Result<HashRecord<T>, typeof OperationError.notExists> {
        const value = this.data.value.get(hash);
        if (!value)
            return new Err(OperationError.notExists);
        return new Ok(value);
    }

    public copyValues(): Map<HashValue, HashRecord<T>> {
        return new Map(this.data.value.entries());
    }

    public clear(): void {
        this.data.value.clear();
    }

    public log(): void {
        console.dir(this.data.value);
    }

    static reset(): void {
        HashBucket.newCount = 0;
        alert('improve this method');
    }
};

export { HashBucket };
