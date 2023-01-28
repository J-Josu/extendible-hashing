import { type InstanceState, type SincronizedState, sincronizedState, Identity, type TupleItemTrait } from '$lib/hashing/general';
import type { ObjectLiteral, Values } from '$lib/utils/types';
import { objectKeys } from '$lib/utils/funtions';
import { Err, Ok, type Result } from 'ts-results';

const EqualityError = {
    notInitialazed: 'NOT_INITIALAZED',
    otherRecord: 'OTHER_RECORD'
} as const;

export type RecordState = InstanceState<{ hash: Identity; isGarbage: boolean; }>;

export type RecordData<T extends ObjectLiteral> = T;


class HashRecord<T extends ObjectLiteral> implements TupleItemTrait<Identity, HashRecord<T>> {
    static readonly EqualityError = EqualityError;
    private static newCount: number = 0;
    readonly state: SincronizedState<RecordState>;
    readonly data: SincronizedState<RecordData<T>>;

    constructor(hash?: number, initialValue?: T) {
        this.state = sincronizedState({
            id: HashRecord.newCount,
            isNew: !initialValue,
            hash: new Identity(hash ?? HashRecord.newCount, HashRecord.newCount),
            isGarbage: true
        });

        // this could cause that a a property doesnt update beacuse the key not exist if the object starts empty
        this.data = sincronizedState(initialValue ?? {} as T);
        HashRecord.newCount += 1;
    }

    get identity() {
        return this.state.value.hash
    }
    isGarbage(): boolean {
        return this.state.value.isGarbage;
    }
    setAsGarbage(): void {
        this.state.update(state => { state.isGarbage = true; return state; });
    }
    isItem(otherIdentity: Identity): boolean {
        return this.state.value.hash.is(otherIdentity);
    }
    compareItem(otherIdentity: Identity): 0 | 1 | -1 {
        if (this.state.value.isGarbage) return 1;
        console.log(this.state.value)
        console.log(otherIdentity)
        return this.state.value.hash.compare(otherIdentity);
    }
    updateFromItem(otherItem: HashRecord<T>) {
        this.state.value.isGarbage = false;
        this.updateData(this.data.value);
        this.updateState(otherItem.state.value)
        return this
    }

    is(otherIdentity: Identity): Result<true, Values<typeof HashRecord.EqualityError>> {
        if (this.state.value.isNew) {
            return new Err(HashRecord.EqualityError.notInitialazed);
        }
        return this.state.value.hash.identity === otherIdentity.identity ? new Ok(true) : new Err(HashRecord.EqualityError.otherRecord);
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
