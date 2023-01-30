const MAX_VALUE = 1_000_000_000;

const usedUniqueValues = new Set<number>();

export const uniqueValue = () => {
    let newValue = Math.floor(Math.random() * MAX_VALUE);
    while (newValue in usedUniqueValues)
        newValue = Math.floor(Math.random() * MAX_VALUE);
    usedUniqueValues.add(newValue);
    return newValue;
};


let maxPossibleNumber = 999999;

const setMaxNumber = (value: number): void => {
    if (value < 0) {
        throw new Error(`new maximun value should be greater than 0, passed '${value}'`);
        value = value < 0 ? value * -1 : 1;
    }
    maxPossibleNumber = value;
};

const randomBoolean = (): boolean => {
    return Math.random() > 0.5;
};
const randomInteger = (): number => {
    return Math.floor(Math.random() * maxPossibleNumber);
};
const randomFloat = (): number => {
    return Math.random() * maxPossibleNumber;
};
const randomString = (length: number): string => {
    return Math.random()
        .toString(20)
        .slice(2, 2 + length);
};

const randomUtils = {
    setMaxNumber: setMaxNumber,
    boolean: randomBoolean,
    integer: randomInteger,
    float: randomFloat,
    string: randomString
} as const;

export { randomUtils as Random }
