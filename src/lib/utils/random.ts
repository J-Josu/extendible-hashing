const MAX_VALUE = 1_000_000_000;

const values = new Set<number>()

export const uniqueValue = () => {
    let newValue = Math.floor(Math.random() * MAX_VALUE)
    while (newValue in values)
        newValue = Math.floor(Math.random() * MAX_VALUE)
    values.add(newValue);
    return newValue;
}