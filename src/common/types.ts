export type Nullable<T> = T | null

export interface Callable<T> {
    (...args: any[]): T
}

export interface Newable<T> {
    new(...args: any[]): T
}

export interface Constructor<T> {
    readonly prototype: T
    new(...args: any[]): T
}
