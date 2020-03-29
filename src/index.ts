/**
 * Returns a promise that will be resolved to `undefined` after given `ms` milliseconds.
 * @param ms Time delay in milliseconds.
 */
export async function delay (ms: number): Promise<undefined>;

/**
 * Returns a promise that will be resolved to `value` after given `ms` milliseconds.
 * @param ms Time delay in milliseconds.
 * @param value Value to be resolved to.
 */
export async function delay<T> (ms: number, value: T): Promise<T>;

/**
 * Returns a promise that will be fulfilled with the fulfillment value of the `value` promise
 * after given `ms` milliseconds the `value` promise is fulfilled.
 * @param ms Time delay in milliseconds.
 * @param value Promise like object to be fulfilled.
 */
export async function delay<T> (ms: number, value: PromiseLike<T>): Promise<T>;

export async function delay<T> (ms: number, value?: T | PromiseLike<T>): Promise<T | undefined> {
  const result = await value
  await new Promise(resolve => setTimeout(resolve, ms))
  return result
}
