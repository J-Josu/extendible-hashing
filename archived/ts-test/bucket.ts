import { InsertError, RemoveError, UpdateError, OperationError, type Values } from '$lib/logic/types';
import type { HashValue, ObjectLiteral } from '$lib/types/hashing';
import { get } from 'svelte/store';
import { Err, Ok, Result } from 'ts-results';
import BaseWritable from './baseWritable';
import type { HashRecord } from './record';

type BucketValues<T extends ObjectLiteral> = Map<HashValue, HashRecord<T>>;

type BucketState<T extends ObjectLiteral> = {
    depth: number;
    readonly maxSize: number;
};

class Bucket<T extends ObjectLiteral> extends BaseWritable<BucketState<T>>{
    readonly id: number;
    #values: BucketValues<T>;

    constructor(id: number, depth: number, size: number, initialValue: BucketValues<T>) {
        super({
            depth,
            maxSize: size
        });
        this.id = id;
        this.#values = initialValue;
    }

    get values(): BucketValues<T> {
        return this.#values;
    }
    public get isFull(): boolean {
        return this.values.size === this.getValue().maxSize;
    }
    public get isEmpty(): boolean {
        return this.values.size === 0;
    }
    public get depth(): number {
        return this.getValue().depth;
    }

    public increaseDepth(): number {
        let newDepth = -1;
        this.update((value) => {
            newDepth = value.depth +=1;
            return value
        })
        return newDepth;
    }
    public decreaseDepth(): number {
        let newDepth = -1;
        this.update((value) => {
            newDepth = value.depth -=1;
            return value
        })
        return newDepth;
    }

    public insert(hash: HashValue, record: HashRecord<T>): Result<true, Values<typeof InsertError>> {
        if (this.values.has(hash))
            return new Err(InsertError.alreadyExists);
        if (this.isFull)
            return new Err(InsertError.isFull);
        this.values.set(hash, record);
        return new Ok(true);
    }

    public remove(hash: HashValue): Result<true, Values<typeof RemoveError>> {
        if (this.values.delete(hash))
            return new Ok(true);
        return new Err(RemoveError.notExists);
    }

    public updateValue(hash: HashValue, record: HashRecord<T>): Result<true, Values<typeof UpdateError>> {
        const old_record = this.values.get(hash);
        if (!old_record)
            return new Err(UpdateError.notExists);
        old_record.updateValueFrom(record);
        return new Ok(true);
    }

    public search(hash: HashValue): Result<HashRecord<T>, typeof OperationError.notExists> {
        const value = this.values.get(hash);
        if (!value)
            return new Err(OperationError.notExists);
        return new Ok(value);
    }

    public copyValues(): Map<HashValue, HashRecord<T>> {
        return new Map(this.values.entries());
    }

    public clear(): void {
        this.values.clear();
    }

    public log(): void {
        console.dir(this.values);
    }
};

export { Bucket };
