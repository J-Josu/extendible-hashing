import { Err, Ok, Result } from 'ts-results';
import { HashBucket } from './bucket';
import { HashRecord } from './record';
import type { ObjectLiteral } from '$lib/typescript/utils/types';
import { type InstanceState, type SincronizedState, sincronizedState, type BasicOperations } from '$lib/hashing/general';
import { Identity } from '$lib/typescript/filled-tuple';
import { InsertError } from '$lib/typescript/errors';

export type DirectoryState = InstanceState<{
    globalDepth: number,
    bucketSize: number,
    incrementalId: number,
    lastRead: number;
}>;

export type DirectoryData<T extends ObjectLiteral = ObjectLiteral> = HashBucket<T>[];


class HashDirectory<T extends ObjectLiteral> implements BasicOperations {
    readonly state: SincronizedState<DirectoryState>;
    readonly data: SincronizedState<DirectoryData<T>>;

    constructor(bucketSize: number, depth: number = 0) {
        this.state = sincronizedState({
            id: 0,
            isNew: true,
            globalDepth: depth > 0 ? depth : 0,
            bucketSize,
            incrementalId: -1,
            lastRead: -1
        });

        this.data = sincronizedState([] as DirectoryData<T>);

        for (let i = 0; i < 1 << depth; i++) {
            // this.data.value.push(this.createBucket(depth));
            this.data.update(data => {
                data.push(this.createBucket(depth));
                return data;
            });
        }
    }

    public get buckets() {
        return this.data.value;
    }

    private createBucket(depth: number): HashBucket<T> {
        this.state.update(state => { state.incrementalId += 1; return state; });

        return new HashBucket<T>(
            depth,
            this.state.value.bucketSize,
            this.state.value.incrementalId
        );
    }

    private hash(key: number): [number, Identity] {
        const index = key & ((1 << this.state.value.globalDepth) - 1);

        return [
            index,
            new Identity(key, key)
        ];
    }

    private pairIndex(baseBucketIndex: number, local_depth: number) {
        return baseBucketIndex ^ (1 << (local_depth - 1));
    }

    private grow(): void {
        this.data.update(data => {
            for (let i = 0; i < 1 << this.state.value.globalDepth; i++)
                data.push(data[i]);
            return data;
        });

        this.state.update(state => { state.globalDepth += 1; return state; });
    }

    private shrink(): void {
        throw new Error('Not implemented');
        // for (const bucket of this.data.value) {
        //     if (bucket.depth === this.state.value.globalDepth)
        //         return;
        // }
        // this.state.value.globalDepth-=1;
        // for (i = 0; i < 1 << global_depth; i++)
        //     buckets.pop_back();
    }

    private split(bucketIndex: number) {
        const localDepth = this.data.value[bucketIndex].increaseDepth();
        if (localDepth > this.state.value.globalDepth)
            this.grow();

        const pairIndex = this.pairIndex(bucketIndex, localDepth);
        this.data.value[pairIndex] = this.createBucket(localDepth);

        const oldRecords = this.data.value[bucketIndex].copyValues();
        this.data.value[bucketIndex].clear();
        // this.data.value[pairIndex].clear()

        const indexDiff = 1 << localDepth;
        const dirSize = 1 << this.state.value.globalDepth;

        for (let i = pairIndex - indexDiff; i >= 0; i -= indexDiff)
            this.data.value[i] = this.data.value[pairIndex];
        for (let i = pairIndex + indexDiff; i < dirSize; i += indexDiff)
            this.data.value[i] = this.data.value[pairIndex];

        for (const value of oldRecords)
            this.insert(value.identity?.baseValue!, value.data.value, true);

        this.state.update(value => value);
        this.data.update((value) => value);
    }

    private merge(bucketIndex: number) {
        const localDepth = this.data.value[bucketIndex].depth;
        const pairIndex = this.pairIndex(bucketIndex, localDepth);
        const indexDiff = 1 << localDepth;
        const dirSize = 1 << this.state.value.globalDepth;

        if (this.data.value[pairIndex].depth == localDepth) {
            this.data.value[pairIndex].decreaseDepth();
            delete (this.data.value[bucketIndex]);
            this.data.value[bucketIndex] = this.data.value[pairIndex];
            for (let i = bucketIndex - indexDiff; i >= 0; i -= indexDiff)
                this.data.value[i] = this.data.value[pairIndex];
            for (let i = bucketIndex + indexDiff; i < dirSize; i += indexDiff)
                this.data.value[i] = this.data.value[pairIndex];

            this.state.update(value => value);
            this.data.update((value) => value);
        }
    }

    public insert(key: number, value: T, reinserted: boolean = false): void {
        const [bucketIndex, identity] = this.hash(key);
        const bucket = this.data.value[bucketIndex];

        const result = bucket.insert(identity, new HashRecord(identity, value));
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

    public remove(key: number, mode: number = 0) {
        const [bucketIndex, identity] = this.hash(key);
        const bucket = this.data.value[bucketIndex];
        if (bucket.remove(identity).ok)
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

    public update(key: number, value: HashRecord<T>) {
        const [bucketIndex, identity] = this.hash(key);
        return this.data.value[bucketIndex].update(identity, value);
    }

    public search(key: number) {
        const [bucketIndex, identity] = this.hash(key);
        const bucket = this.data.value[bucketIndex];
        console.log(`Searching key ${key} in bucket ${bucket.id}`);
        return bucket.search(identity);
    }

    public log(duplicates: boolean = false): void {
        const buckets = duplicates ? this.data.value : new Set(this.data.value);
        for (const bucket of buckets) {
            bucket.log();
        }
    }

    public clear(): void {
        this.data.value.splice(0);
        this.state.value.incrementalId = -1;
    }
};

export { HashDirectory };
