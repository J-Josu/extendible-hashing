import { Ok, Err, Result } from 'ts-results';
import type { HashRecord } from './old_record';
import type { HashValue, ObjectLiteral } from './types';



class HashBucket<T extends ObjectLiteral>{
    public readonly id: number;
    private _depth: number;
    private _records: HashRecord<T>[];
    private _recordCount: number;

    constructor(id: number, depth: number = 0) {
        this.id = id;
        this._depth = depth;
        this._recordCount = 0;
        this._records = [];


        const $ = this;
    }

    public get depth() {
        return this._depth;
    }

    public get recordCount() {
        return this._recordCount;
    }

    public get isFull() {
        return this._records.length === 2 ** this._depth;
    }


    peekRecords(): HashRecord<T>[] {
        return [...this._records];
    }

    setRecords(values: HashRecord<T>[]) {
        this._records.splice(0, this._records.length, ...values);
    }

    updateByOverflow(): HashRecord<T>[] {
        this._depth += 1;
        return this._records.splice(0, this._records.length);
    }

    exist(hash: HashValue) {
        return !!this._records.find(element => element.is(hash));
    }

    add(record: HashRecord<T>) {
        if (this.isFull) false;
        if (this.exist(record.hash)) return false;
        this._records.push(record);
        this._depth += 1;
        return true;
    };

    get(hash: HashValue) {
        const index = this._records.findIndex(record => record.is(hash));
        if (index < 0) return new Err(`No se encuentra elemento con el hash '${hash}'`);
        return new Ok<[number, HashRecord<T>]>([index, this._records[index]]);
    }

    remove(hash: HashValue) {
        const element = this.get(hash);
        if (element.err)
            return false;

        const [index, _] = element.val;
        this._records.splice(index, 1);
        this._depth -= 1;
        return true;
    }

    update(hash: HashValue, values: Partial<T>) {
        const element = this.get(hash);
        if (element.err)
            return false;
        const [_, record] = element.val;
        record.update(values);
        return true;
    }
}

export { HashBucket as HashNode };

// class Bucket implements Operations<number>{
//     private level: number;
//     private values: number[];

//     constructor() {
//         this.level = 0;
//         this.values = [];


//         const $ = this;
//     }

//     isFull() {
//         return this.values.length === 2 ** this.level;
//     }


//     add(value: number) {
//         if (this.exist(value)) return false;
//         this.values.push(value);
//         return true;
//     };

//     exist(value: number) {
//         return !!this.values.find(element => element === value);
//     }

//     get(key: number) {
//         const value = this.values.find(element => element === key);
//         if (!value) return Err(`No se encuentra el elemento para el hash ${key}`);
//         return Ok(value);
//     }
// }
