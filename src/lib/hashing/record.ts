import type { Identity, FilledTupleItemTrait } from '$lib/typescript/filled-tuple';
import type { PrimitiveObjectLiteral, Values } from '$lib/typescript/utils/types';
import { objectKeys } from '$lib/typescript/utils/functions';
import { Err, Ok, type Result } from 'ts-results';
import { dataController } from './data';
import { sincronizedState, type InstanceState, type SincronizedState } from './general';

export const EqualityError = {
    notInitialazed: 'NOT_INITIALAZED',
    otherRecord: 'OTHER_RECORD'
} as const;

export type RecordState = InstanceState<{ hash?: Identity; isGarbage: boolean; }>;

export type RecordData<T extends PrimitiveObjectLiteral> = T;


class HashRecord<T extends PrimitiveObjectLiteral> implements FilledTupleItemTrait<HashRecord<T>> {
    static readonly EqualityError = EqualityError;
    private static newCount: number = 0;

    readonly state: SincronizedState<RecordState>;
    readonly data: SincronizedState<RecordData<T>>;

    constructor(hash?: Identity, initialData?: T) {
        this.state = sincronizedState({
            id: HashRecord.newCount,
            isNew: !hash,
            isGarbage: !hash,
            hash: hash,
        });

        // rethink how this class knows of dataController.generateData 
        this.data = sincronizedState(initialData ?? dataController.generateData() as T);
        HashRecord.newCount += 1;
    }

    get identity() {
        return this.state.value.hash;
    }
    isGarbage(): boolean {
        return this.state.value.isGarbage;
    }
    setAsGarbage(): void {
        this.state.update(state => {
            state.isGarbage = true;
            state.hash = undefined;
            return state;
        });
    }
    setAsValid(): void {
        this.state.update(state => { state.isGarbage = false; return state; });
    }
    isItem(otherIdentity: Identity): boolean {
        if (!this.state.value.hash) return false;

        return this.state.value.hash.is(otherIdentity);
    }
    compareIdentity(otherIdentity: Identity): -1 | 0 | 1 {
        return this.state.value.hash!.compare(otherIdentity);
    }
    compareItem(otherItem: HashRecord<T>): -1 | 0 | 1 {
        if (this.state.value.isGarbage) return 1;
        
        return this.state.value.hash!.compare(otherItem.state.value.hash!);
    }
    setFromItem(otherItem: HashRecord<T>): HashRecord<T> {
        this.updateData(otherItem.data.value);
        this.updateState(otherItem.state.value);
        this.setAsValid();
        return this;
    }
    // compareItem(otherIdentity: Identity): 0 | 1 | -1 {
    //     if (this.state.value.isGarbage) return 1;

    //     return this.state.value.hash.compare(otherIdentity);
    // }
    // updateFromItem(otherItem: HashRecord<T>) {
    //     this.updateData(this.data.value);
    //     this.updateState(otherItem.state.value);
    //     this.setAsValid()
    //     return this;
    // }

    is(otherIdentity: Identity): Result<true, Values<typeof HashRecord.EqualityError>> {
        if (this.state.value.isNew) {
            return new Err(HashRecord.EqualityError.notInitialazed);
        }
        return this.state.value.hash?.is(otherIdentity) ? new Ok(true) : new Err(HashRecord.EqualityError.otherRecord);
    }

    get isNew(): boolean {
        return this.state.value.isNew;
    }

    setInitialValue(value: T) {
        this.data.update(data => {
            objectKeys(value).forEach(k => {
                data[k] = value[k];
            });
            return value;
        });

        this.state.update(state => {
            state.isNew = false;
            return state;
        });
    }

    updateState(newState: RecordState) {
        this.state.update(state => {
            state.hash = newState.hash;
            state.isGarbage = false;
            state.isNew = false;
            return state;
        });
    }

    updateData(newValues: Partial<T>) {
        this.data.update((value) => {
            for (const key in newValues) {
                if (key in value) {
                    value[key] = newValues[key] ?? value[key];
                }
            }
            return value;
        });
    }

    updateDataFrom(record: HashRecord<T>) {
        this.updateData(record.data.value as T);
    }

    static reset() {
        HashRecord.newCount = 0;
        alert('improve this method');
    }
};

export { HashRecord };
