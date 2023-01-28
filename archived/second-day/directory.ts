import { Err, Ok, Result } from 'ts-results';
import { HashBucket } from './bucket';
import type { HashRecord } from './record';
import { InsertError, OperationError, RemoveError, UpdateError, type Values } from '$lib/logic/types';
import type { HashValue, ObjectLiteral } from '$lib/types/hashing';
import type { Writable } from 'svelte/store';
import { valuedWritable } from './utils';

export type DirectoryState = {
    globalDepth: number,
    bucketSize: number,
    incrementalId: number,
    lastRead:number
};

export type DirectoryStateStore = Writable<DirectoryState>;

export type DirectoryData<T extends ObjectLiteral> = HashBucket<T>[];

export type DirectoryDataStore<T extends ObjectLiteral = ObjectLiteral> = Writable<DirectoryData<T>>;


class HashDirectory<T extends ObjectLiteral>{
    #state: DirectoryState;
    state: DirectoryStateStore;
    #data: DirectoryData<T>;
    data: DirectoryDataStore<T>;

    constructor(bucketSize: number, depth: number = 0) {
        const [stateStore, stateRef] = valuedWritable({
            globalDepth: depth > 0 ? depth : 0,
            bucketSize,
            incrementalId: 0,
            lastRead:-1
        });
        this.#state = stateRef;
        this.state = stateStore;
        // let count = 0;
        // const placeHolders = new Array(size).fill(new HashRecord(count++, { val1: 1, val2: 2 }));
        const [dataStore, dataRef] = valuedWritable([] as DirectoryData<T>);
        this.#data = dataRef;
        this.data = dataStore;
        this.#state.globalDepth = depth > 0 ? depth : 0;
        this.#state.bucketSize = bucketSize;
        this.#state.incrementalId = -1;

        for (let i = 0; i < 1 << depth; i++) {
            this.#data.push(this.createBucket(depth));
        }

        // this.data.update((value) => value)
    }

    public get buckets() {
        return this.#data;
    }
    private createBucket(depth: number): HashBucket<T> {
        this.#state.incrementalId += 1;
        this.state.update(value => value)
        return new HashBucket<T>(depth, this.#state.bucketSize, this.#state.incrementalId);
    }

    private hash(key: number): number {
        return key & ((1 << this.#state.globalDepth) - 1);
    }

    private pairIndex(baseBucketIndex: number, local_depth: number) {
        return baseBucketIndex ^ (1 << (local_depth - 1));
    }

    private grow(): void {
        for (let i = 0; i < 1 << this.#state.globalDepth; i++)
            this.#data.push(this.#data[i]);
        this.#state.globalDepth++;
        this.state.update(value => value);
    }

    private shrink(): void {
        throw new Error('Not implemented');
        // for (const bucket of this.#data) {
        //     if (bucket.depth === this.#state.globalDepth)
        //         return;
        // }
        // this.#state.globalDepth-=1;
        // for (i = 0; i < 1 << global_depth; i++)
        //     buckets.pop_back();
    }

    private split(bucketIndex: number) {
        const localDepth = this.#data[bucketIndex].increaseDepth();
        if (localDepth > this.#state.globalDepth)
            this.grow();

        const pairIndex = this.pairIndex(bucketIndex, localDepth);
        this.#data[pairIndex] = this.createBucket(localDepth);

        const oldRecords = this.#data[bucketIndex].copyValues();
        this.#data[bucketIndex].clear();

        const indexDiff = 1 << localDepth;
        const dirSize = 1 << this.#state.globalDepth;

        for (let i = pairIndex - indexDiff; i >= 0; i -= indexDiff)
            this.#data[i] = this.#data[pairIndex];
        for (let i = pairIndex + indexDiff; i < dirSize; i += indexDiff)
            this.#data[i] = this.#data[pairIndex];

        for (const [key, value] of oldRecords)
            this.insert(key, value, true);

        this.state.update(value => value);
        this.data.update((value) => value);
    }

    private merge(bucketIndex: number) {
        const localDepth = this.#data[bucketIndex].depth;
        const pairIndex = this.pairIndex(bucketIndex, localDepth);
        const indexDiff = 1 << localDepth;
        const dirSize = 1 << this.#state.globalDepth;

        if (this.#data[pairIndex].depth == localDepth) {
            this.#data[pairIndex].decreaseDepth();
            delete (this.#data[bucketIndex]);
            this.#data[bucketIndex] = this.#data[pairIndex];
            for (let i = bucketIndex - indexDiff; i >= 0; i -= indexDiff)
                this.#data[i] = this.#data[pairIndex];
            for (let i = bucketIndex + indexDiff; i < dirSize; i += indexDiff)
                this.#data[i] = this.#data[pairIndex];

            this.state.update(value => value);
            this.data.update((value) => value);
        }
    }

    public insert(key: HashValue, value: HashRecord<T>, reinserted: boolean = false): void {
        const bucketIndex = this.hash(key);
        const bucket = this.#data[bucketIndex];
        const result = bucket.insert(key, value);
        if (result.ok) {
            if (!reinserted)
                console.log(`Inserted key ${key} in bucket ${bucket.id}`);
            else
                console.log(`Moved key ${key} to bucket ${bucket.id}`);
            this.state.update(value => value);
            this.data.update((value) => value);
            return;
        }
        if (result.val === InsertError.isFull) {
            this.split(bucketIndex);
            this.insert(key, value, reinserted);
            this.state.update(value => value);
            this.data.update((value) => value);
            return;
        }
        console.log(`Key ${key} already exists in bucket ${bucket.id}`);
    }

    public remove(key: HashValue, mode: number = 0) {
        const bucketIndex = this.hash(key);
        const bucket = this.#data[bucketIndex];
        if (bucket.remove(key).ok)
            console.log(`Deleted key ${key} from bucket ${bucket.id}`);
        if (mode > 0) {
            if (bucket.isEmpty && bucket.depth > 1)
                this.merge(bucketIndex);
        }
        if (mode > 1) {
            this.shrink();
        }
        this.state.update(value => value);
    }

    public update(key: HashValue, value: HashRecord<T>) {
        const bucketIndex = this.hash(key);
        return this.#data[bucketIndex].update(key, value);
    }

    public search(key: HashValue) {
        const bucketIndex = this.hash(key);
        const bucket = this.#data[bucketIndex];
        console.log(`Searching key ${key} in bucket ${bucket.id}`);
        return bucket.search(key);
    }

    public log(duplicates: boolean = false): void {
        const buckets = duplicates ? this.#data : new Set(this.#data);
        for (const bucket of buckets) {
            bucket.log();
        }
    }

    public clear(): void {
        this.#data.splice(0);
        this.#state.incrementalId = -1;
    }
};

export { HashDirectory };
