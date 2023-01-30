import { isBoolean, isNumber, isString } from '$lib/typescript/utils/functions';
import { Random } from '$lib/typescript/utils/random';
import type { PrimitiveObjectLiteral } from '$lib/typescript/utils/types';


type StringTypeToType = {
    'boolean': boolean;
    'number': number;
    'string': string;
};

type Primitives = keyof StringTypeToType;


type PrimitiveGenerator<T extends Primitives> = (...args: any[]) => StringTypeToType[T];

type DataType<T extends Primitives> = {
    readonly type: T,
    readonly new: PrimitiveGenerator<T>;
};

function createDataType<T extends Primitives>(type: T, generator: PrimitiveGenerator<T>): DataType<T> {
    return {
        type: type,
        new: generator
    } as const;
}

function dataTypeFactory<T extends Primitives>(type: T, stringSize: number = 16): DataType<T> {
    if (isBoolean(type))
        return createDataType(type, Random.boolean);

    if (isNumber(type))
        return createDataType(type, Random.integer);

    if (isString(type))
        return createDataType(type, () => Random.string(stringSize));

    throw new Error(`Not implemented factory for '${type}' type`);
}


type AttributeDefinition = {
    keyName: string,
    valueType: Primitives;
};

class DataSchema {
    #composition: readonly (readonly [string, DataType<Primitives>])[];

    constructor(definition: AttributeDefinition[]) {
        this.#composition = definition.map(
            attribute => [attribute.keyName, dataTypeFactory(attribute.valueType)] as const
        );
    }

    generate(): PrimitiveObjectLiteral {
        return Object.fromEntries(
            this.#composition.map(
                ([key, dataType]) => [key, dataType.new()]
            )
        );
    }
}

const defaultDataSchema = new DataSchema([
    { keyName: 'state', valueType: 'boolean' },
    { keyName: 'value', valueType: 'number' },
    { keyName: 'text', valueType: 'string' }
]);

class DataController {
    #schema: DataSchema;
    constructor(initialSchema?: DataSchema) {
        this.#schema = initialSchema ?? defaultDataSchema;
    }

    get currentSchema() {
        return this.#schema;
    }

    setSchema(definition: AttributeDefinition[]): void {
        this.#schema = new DataSchema(definition);
    }

    // generateData<T extends PrimitiveObjectLiteral = PrimitiveObjectLiteral>(): T {
    generateData(): PrimitiveObjectLiteral {
        return this.#schema.generate();
    }
}

export { DataController };

export const dataController = new DataController();



// class DataType<T extends Primitives> {
//     readonly type: T;
//     new: (...args: any[]) => StringTypeToType[T];

//     constructor(type: T, generator: (...args: any[]) => StringTypeToType[T]) {
//         this.type = type;
//         this.new = generator;
//     }
// };
