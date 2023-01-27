import { Err, Ok, Result } from 'ts-results';
import type { HashRecord } from './record';
import { InsertError, OperationError, RemoveError, UpdateError, type HashValue, type ObjectLiteral, type Values } from './types';


class Bucket<T extends ObjectLiteral>{
    private _depth: number;
    private _MAX_SIZE: number;
    private values: Map<HashValue, HashRecord<T>>;
    public readonly id: number;

    constructor(depth: number, size: number, id:number) {
        this._depth = depth;
        this._MAX_SIZE = size;
        this.values = new Map<HashValue, HashRecord<T>>();
        this.id = id;
    }

    public get isFull(): boolean {
        return this.values.size === this._MAX_SIZE;
    }
    public get isEmpty(): boolean {
        return this.values.size === 0;
    }
    public get depth(): number {
        return this._depth;
    }

    public increaseDepth():number {
        this._depth+=1;
        return this._depth;
    }
    public decreaseDepth():number {
        this._depth-=1;
        return this._depth;
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

    public update(hash: HashValue, record: HashRecord<T>): Result<true, Values<typeof UpdateError>> {
        const old_record = this.values.get(hash);
        if (!old_record)
            return new Err(UpdateError.notExists);
        old_record.updateFromRecord(record);
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