// import type { Ok, Err, Result } from 'ts-results';
// import type { HashRecord } from './old_record';

export type ObjectLiteral = { [key: string]: any; };

export type HashValue = number;

export type Values<T> = T[keyof T];
export const InsertError  = {
    alreadyExists : 'ALREADY_EXISTS',
    isFull : 'IS_FULL',
} as const;
export const RemoveError = {
    notExists : 'NOT_EXISTS',
    isEmpty : 'IS_EMPTY',
} as const;
export const UpdateError = {
    notExists : 'NOT_EXISTS',
} as const;
export const OperationError = { ...UpdateError, ...InsertError, ...RemoveError } as const;;

// export type OperationError = typeof OperationError;

// export interface Operations<T extends ObjectLiteral> {
//     exist: (hash: HashValue) => boolean;
//     add: (record: HashRecord<T>) => boolean;
//     get: (hash: HashValue) => Result<[number, HashRecord<T>], string>;
//     remove: (hash: HashValue) => boolean;
//     update: (hash: HashValue, values: Partial<T>) => boolean;
//     get level(): number;
//     get recordCount(): number;
// }

// export enum InsertError {
//     alreadyExists = 'ALREADY_EXISTS',
//     isFull = 'IS_FULL',
// }
// export enum RemoveError {
//     notExists = 'NOT_EXISTS',
//     isEmpty = 'IS_EMPTY',
// }
// export enum UpdateError {
//     notExists = 'NOT_EXISTS',
// }
// export const OperationError = { ...UpdateError, ...InsertError, ...RemoveError };

// export type OperationError = typeof OperationError;
