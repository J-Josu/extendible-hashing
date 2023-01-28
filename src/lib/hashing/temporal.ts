import { type HashValue, type InstanceState, type SincronizedState, sincronizedState, type BasicOperations, FilledTuple, type FilledTupleInitilization } from '$lib/hashing/general';
import { logAsJson } from '$lib/utils/funtions';
import type { ObjectLiteral, Values } from '$lib/utils/types';
import { Err, Ok, Result } from 'ts-results';
import { HashRecord } from './record';


export type BucketState = InstanceState<{
    readonly maxSise: number;
    readonly nrr: number;
    depth: number;
}>;

export type BucketData<T extends ObjectLiteral = ObjectLiteral> = FilledTuple<HashRecord<T>>;


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
        const config = {
            length: size
        } as FilledTupleInitilization<HashRecord<T>>;
        if (initialValue)
            config.value = initialValue.items;
        else
            config.factory = (i,_) => new HashRecord<T>();

        this.data = sincronizedState(new FilledTuple(config));

        HashBucket.newCount += 1;
    }

    static initializeBucket() {

    };

    public get id(): number {
        return this.state.value.id;
    }
    public get isFull(): boolean {
        return this.data.value.isFull
    }
    public get isEmpty(): boolean {
        return this.data.value.isEmpty
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
            this.data.update(e => e);
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
