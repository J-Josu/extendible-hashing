import type { HashValue, ObjectLiteral } from '$lib/types/hashing';
import { valuedWritableOld, type ValuedWritableOld } from './utils';

export type RecordState<T = {
    readonly hash: HashValue;
}
> = ValuedWritableOld<T>;

export type RecordData<T extends ObjectLiteral = ObjectLiteral> = ValuedWritableOld<T>;

class HashRecord<T extends ObjectLiteral> {
    readonly state: RecordState;
    readonly data: RecordData<T>;

    constructor(hash: HashValue, initialValue: T) {
        this.state = valuedWritableOld({ hash });
        this.data = valuedWritableOld(initialValue);
    }

    is(hash: HashValue) {
        return this.state.value.hash === hash;
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
        this.updateData(record.data.value);
    }

    updateSubscribers() {
        this.state.update(value => value);
        this.data.update(value => value);
    }
};

export { HashRecord };
