export function delay(ms: number): Promise<undefined>;
export function delay<T>(ms: number, value: T | PromiseLike<T>): Promise<T>;
