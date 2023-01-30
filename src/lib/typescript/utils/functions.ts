export function logAsJson(value: any) {
    console.log(JSON.stringify(value, null, 2));
}


export function objectKeys<T extends object>(obj: T): (keyof T)[] {
    return Object.keys(obj) as (keyof T)[];
};


export function isBoolean(type: string): type is 'boolean' {
    return type === 'boolean';
}

export function isNumber(type: string): type is 'number' {
    return type === 'number';
}

export function isString(type: string): type is 'string' {
    return type === 'string';
}



const baseBinarySearch = <T>(arr: T[], value: T): [boolean, number] => {
    let start = 0;
    let end = arr.length - 1;
    while (start <= end) {
        const cur = Math.floor((start + end) / 2);
        if (arr[cur] === value) {
            return [true, cur];
        } else if (arr[cur] < value) {
            start = cur + 1;
        } else {
            end = cur - 1;
        }
    }
    return [false, -1];
};
