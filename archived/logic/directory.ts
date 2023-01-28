import { Err, Ok, Result } from 'ts-results';
import { Bucket } from './bucket';
import type { HashRecord } from './record';
import { InsertError, OperationError, RemoveError, UpdateError, type HashValue, type ObjectLiteral, type Values } from './types';


class Directory<T extends ObjectLiteral>{
    private _globalDepth: number;
    private _bucketSize: number;
    public _buckets: Bucket<T>[];
    private _bucketIncrementalId: number;

    constructor(bucketSize: number, depth: number = 0) {
        this._globalDepth = depth > 0 ? depth : 0;
        this._bucketSize = bucketSize;
        this._buckets = [];
        this._bucketIncrementalId = -1;

        for (let i = 0; i < 1 << depth; i++) {
            this._buckets.push(this.createBucket(depth));
        }
    }

    public get buckets() {
        return this._buckets;
    }
    private createBucket(depth: number): Bucket<T> {
        this._bucketIncrementalId += 1;
        return new Bucket<T>(depth, this._bucketSize, this._bucketIncrementalId);
    }

    private hash(key: number): number {
        return key & ((1 << this._globalDepth) - 1);
    }

    private pairIndex(baseBucketIndex: number, local_depth: number) {
        return baseBucketIndex ^ (1 << (local_depth - 1));
    }

    private grow(): void {
        for (let i = 0; i < 1 << this._globalDepth; i++)
            this._buckets.push(this._buckets[i]);
        this._globalDepth++;
    }

    private shrink(): void {
        throw new Error('Not implemented');
        // for (const bucket of this._buckets) {
        //     if (bucket.depth === this._globalDepth)
        //         return;
        // }
        // this._globalDepth-=1;
        // for (i = 0; i < 1 << global_depth; i++)
        //     buckets.pop_back();
    }

    private split(bucketIndex: number) {
        const localDepth = this._buckets[bucketIndex].increaseDepth();
        if (localDepth > this._globalDepth)
            this.grow();

        const pairIndex = this.pairIndex(bucketIndex, localDepth);
        this._buckets[pairIndex] = this.createBucket(localDepth);

        const oldRecords = this._buckets[bucketIndex].copyValues();
        this._buckets[bucketIndex].clear();

        const indexDiff = 1 << localDepth;
        const dirSize = 1 << this._globalDepth;

        for (let i = pairIndex - indexDiff; i >= 0; i -= indexDiff)
            this._buckets[i] = this._buckets[pairIndex];
        for (let i = pairIndex + indexDiff; i < dirSize; i += indexDiff)
            this._buckets[i] = this._buckets[pairIndex];

        for (const [key, value] of oldRecords)
            this.insert(key, value, true);
    }

    private merge(bucketIndex: number) {
        const localDepth = this._buckets[bucketIndex].depth;
        const pairIndex = this.pairIndex(bucketIndex, localDepth);
        const indexDiff = 1 << localDepth;
        const dirSize = 1 << this._globalDepth;

        if (this._buckets[pairIndex].depth == localDepth) {
            this._buckets[pairIndex].decreaseDepth();
            delete (this._buckets[bucketIndex]);
            this._buckets[bucketIndex] = this._buckets[pairIndex];
            for (let i = bucketIndex - indexDiff; i >= 0; i -= indexDiff)
                this._buckets[i] = this._buckets[pairIndex];
            for (let i = bucketIndex + indexDiff; i < dirSize; i += indexDiff)
                this._buckets[i] = this._buckets[pairIndex];
        }
    }

    public insert(key: HashValue, value: HashRecord<T>, reinserted: boolean = false): void {
        const bucketIndex = this.hash(key);
        const bucket = this._buckets[bucketIndex];
        const result = bucket.insert(key, value);
        if (result.ok) {
            if (!reinserted)
                console.log(`Inserted key ${key} in bucket ${bucket.id}`);
            else
                console.log(`Moved key ${key} to bucket ${bucket.id}`);
            return;
        }
        if (result.val === InsertError.isFull) {
            this.split(bucketIndex);
            this.insert(key, value, reinserted);
            return;
        }
        console.log(`Key ${key} already exists in bucket ${bucket.id}`);
    }

    public remove(key: HashValue, mode: number = 0) {
        const bucketIndex = this.hash(key);
        const bucket = this._buckets[bucketIndex];
        if (bucket.remove(key).ok)
            console.log(`Deleted key ${key} from bucket ${bucket.id}`);
        if (mode > 0) {
            if (bucket.isEmpty && bucket.depth > 1)
                this.merge(bucketIndex);
        }
        if (mode > 1) {
            this.shrink();
        }
    }

    public update(key: HashValue, value: HashRecord<T>) {
        const bucketIndex = this.hash(key);
        return this._buckets[bucketIndex].update(key, value);
    }

    public search(key: HashValue) {
        const bucketIndex = this.hash(key);
        const bucket = this._buckets[bucketIndex];
        console.log(`Searching key ${key} in bucket ${bucket.id}`);
        return bucket.search(key);
    }

    public log(duplicates: boolean = false): void {
        const buckets = duplicates ? this._buckets : new Set(this._buckets);
        for (const bucket of buckets) {
            bucket.log();
        }
    }

    public clear(): void {
        this._buckets.splice(0);
        this._bucketIncrementalId = -1;
    }
};

export { Directory };
