import { type InstanceState, type SincronizedState, sincronizedState, type BasicOperations } from '$lib/hashing/general';
import type { InsertError, RemoveError, SearchError, UpdateError } from '$lib/typescript/errors';
import { FilledTuple, Identity, type FilledTupleInitilization } from '$lib/typescript/filled-tuple';
import type { ObjectLiteral, Values } from '$lib/typescript/utils/types';
import { Err, Ok, Result } from 'ts-results';
import { HashRecord } from './record';


export type BucketState = InstanceState<{
    readonly maxSise: number;
    readonly nrr: number;
    depth: number;
}>;

export type BucketData<T extends ObjectLiteral = ObjectLiteral> = FilledTuple<HashRecord<T>>;


class HashBucket<T extends ObjectLiteral> implements BasicOperations {
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

        const config = {
            length: size,
        } as FilledTupleInitilization<HashRecord<T>>;
        if (initialValue)
            config.initialItems = initialValue.items;
        else
            config.itemFactory = (i, _) => new HashRecord<T>();

        this.data = sincronizedState(new FilledTuple(config));

        HashBucket.newCount += 1;
    }

    static initializeBucket() {

    };

    public get id(): number {
        return this.state.value.id;
    }
    public get isFull(): boolean {
        return this.data.value.isFull;
    }
    public get isEmpty(): boolean {
        return this.data.value.isEmpty;
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

    public insert(hash: Identity, record: HashRecord<T>): Result<true, Values<typeof InsertError>> {
        return this.data.value
            .insert(record)
            .andThen(_ => {
                this.data.update(data => data);
                return new Ok(true);
            });
    }

    public remove(hash: Identity): Result<true, Values<typeof RemoveError>> {
        return this.data.value
            .remove(hash)
            .andThen(_ => {
                this.data.update(e => e);
                return new Ok(true);
            });
    }

    public update(hash: Identity, record: HashRecord<T>): Result<true, Values<typeof UpdateError>> {
        return this.data.value
            .update(hash, record)
            .andThen(_ => {
                this.data.update(e => e);
                return new Ok(true);
            });
    }

    public search(hash: Identity): Result<HashRecord<T>, Values<typeof SearchError>> {
        return this.data.value
            .find(hash)
            .map(([_, record]) => record);
    }

    public copyValues(): HashRecord<T>[] {
        return [...this.data.value.items];
    }

    public clear(): void {
        this.data.update(data => {
            data.clear()
            return data;
        })
        // this.data.value.forEach(item => item.setAsGarbage());
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
