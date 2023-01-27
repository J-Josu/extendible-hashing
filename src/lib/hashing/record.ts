import { type HashValue, type InstanceState, type SincronizedState, sincronizedState } from '$lib/hashing/general';
import type { ObjectLiteral, Values } from '$lib/utils/types';
import { objectKeys } from '$lib/utils/funtions';
import { Err, Ok, type Result } from 'ts-results';

const EqualityError = {
    notInitialazed: 'NOT_INITIALAZED',
    otherRecord: 'OTHER_RECORD'
} as const;

export type RecordState = InstanceState<{ hash: HashValue; }>;

export type RecordData<T extends ObjectLiteral> = T;


class HashRecord<T extends ObjectLiteral> {
    static readonly EqualityError = EqualityError;
    private static newCount: number = 0;
    readonly state: SincronizedState<InstanceState<{ hash: HashValue; }>>;
    readonly data: SincronizedState<T>;

    constructor(hash?: HashValue, initialValue?: T) {
        this.state = sincronizedState({
            id: HashRecord.newCount,
            isNew: !initialValue,
            hash: hash ?? HashRecord.newCount
        });

        this.data = sincronizedState(initialValue ?? {} as T);
        HashRecord.newCount += 1;
    }

    is(hash: HashValue): Result<true, Values<typeof HashRecord.EqualityError>> {
        if (this.state.value.isNew) {
            return new Err(HashRecord.EqualityError.notInitialazed);
        }
        return this.state.value.hash === hash ? new Ok(true) : new Err(HashRecord.EqualityError.otherRecord);
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
