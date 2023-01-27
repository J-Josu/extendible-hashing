import { HashNode } from './old_bucket';
import type { HashRecord } from './old_record';
import type { HashValue, ObjectLiteral, Operations } from './types';

class HashDirectory<T extends ObjectLiteral>{
    private _depth: number;
    private directory: HashNode<T>[];
    private _recordCount: number;
    private _nodeIncrementalId: number;
    
    constructor() {
        this._depth = 1;
        this._recordCount = 0;
        this.directory = [new HashNode<T>(0), new HashNode<T>(1)];
        this._nodeIncrementalId = 1;

        const $ = this;
    }

    public get depth() {
        return this._depth;
    }

    public get recordCount() {
        return this._recordCount;
    }

    public getIndex(hash: HashValue) {
        return hash & ((1 << this._depth) - 1);
    }

    exist(hash: HashValue) {
        if (this._recordCount === 0)
            return false;
        const index = this.getIndex(hash);
        return this.directory[index].exist(hash);
    }

    doubleDirectory() {
        this.directory = [...this.directory, ...this.directory];
        this._depth += 1;
    }


    private reHashRecords(records: HashRecord<T>[]) {
        for (const record of records) {
            const index = this.getIndex(record.hash);
            this.directory[index].add(record);
        }
    }

    _add(newRecord: HashRecord<T>) {
        const index = this.getIndex(newRecord.hash);
        const node = this.directory[index];
        if (!node.isFull) {
            node.add(newRecord);
            return;
        }
        if (this._depth === node.depth)
            this.doubleDirectory();
        else {
            this._nodeIncrementalId++;
            this.directory[index ^ (1 << (node.depth))] = new HashNode(this._nodeIncrementalId, node.depth + 1);
        }
        [...node.updateByOverflow(), newRecord].forEach(record => this.add(record));
    }

    add(newRecord: HashRecord<T>) {
        this._recordCount++;
        this._add(newRecord);
    }

    add2(newRecord: HashRecord<T>) {
        const index = this.getIndex(newRecord.hash);
        const node = this.directory[index];
        if (node.isFull) {
            if (this._depth === node.depth)
                this.doubleDirectory();
            else {
                this._nodeIncrementalId++;
                this.directory[index ^ (1 << (node.depth))] = new HashNode(this._nodeIncrementalId, node.depth + 1);
            }
            [...node.updateByOverflow(), newRecord].forEach(record => this.add(record));
        }
        else {
            node.add(newRecord);
        }
    }
}

export { HashDirectory as HashTable };
