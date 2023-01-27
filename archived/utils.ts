

// type keys = keyof BaseInstanceState
// type base<T extends { [k?:keys]: never; [K: PropertyKey]: unknown; }> = BaseInstanceState & T;
// type hola = base<{id:number}>
// type base2<O, T extends {[k:(keyof O)]?:never;} & { val?: never;[K: PropertyKey]: unknown; }> = { val: number; } & T;

// export type InstanceState<
//     T extends Record<keyof BaseInstanceState[], never> &
//     { [K: PropertyKey]: unknown; }
// > = BaseInstanceState & T;

// type OmitOnGeneric<
//     Omited extends object,
//     T extends Partial<Record<keyof Omited, never>> &
//     { [K: PropertyKey]: unknown; }
// > = Omited & T;


// type prueba<T extends {valor:never}> = OmitOnGeneric<{valor:number}, T>

// type pedro = prueba<{valor1:number}>

// export type InstanceState<T extends object> = OmitOnGeneric<BaseInstanceState, T>;

export type ValuedWritablee<T> = {
    set: Writable<T>["set"];
    update: Writable<T>["update"];
    subscribe: Writable<T>["subscribe"];
    readonly value: T;
    notifyUpdate: () => void;
};


// export function valuedWritableOld<T>(value: T): ValuedWritableOld<T> {
//     return {
//         ...writable(value),
//         value
//     };
// }

// export function valuedWritable<T>(value: T): [Writable<T>, T] {
//     return [
//         writable(value),
//         value
//     ];
// }
