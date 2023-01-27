export const objectKeys = <T extends object>(obj: T): (keyof T)[] => {
    return Object.keys(obj) as (keyof T)[];
};

export const logAsJson = (value: any) => console.log(JSON.stringify(value, null, 2));
