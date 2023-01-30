export const InsertError = {
    alreadyExists: 'ALREADY_EXISTS',
    isFull: 'IS_FULL',
} as const;
export const SearchError = {
    notExists: 'NOT_EXISTS',
} as const;
export const RemoveError = {
    notExists: 'NOT_EXISTS',
    isEmpty: 'IS_EMPTY',
} as const;
export const UpdateError = {
    notExists: 'NOT_EXISTS',
} as const;
export const OperationError = { ...InsertError, ...SearchError, ...UpdateError, ...RemoveError } as const;
