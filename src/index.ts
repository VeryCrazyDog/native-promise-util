export type Resolvable<R> = R | PromiseLike<R>;
export type IterateFunction<T, R> = (item: T, index: number, length: number) => Resolvable<R>;

export interface MapExecutionOptions {
  concurrency?: number
}

/**
 * Returns a promise that will be resolved to `undefined` after given `ms` milliseconds.
 * @param ms Time delay in milliseconds.
 */
export async function delay (ms: number): Promise<undefined>;

/**
 * Returns a promise that will first resolve the `value`, then wait for given `ms` milliseconds
 * before returning the resolved value.
 * @param ms Time delay in milliseconds.
 * @param value Value to be resolved to or a promise-like object to be fulfilled.
 */
export async function delay<T> (ms: number, value: Resolvable<T>): Promise<T>;

export async function delay<T> (ms: number, value?: Resolvable<T>): Promise<T | undefined> {
  const result = await value
  await new Promise(resolve => setTimeout(resolve, ms))
  return result
}

interface MapExecutionContext<I, O> {
  iterator: Iterator<Resolvable<I>>
  inputLength: number
  iteratedCount: number
  mapper: IterateFunction<I, O>
  output: O[]
}

function getLength (iterable: Iterable<Resolvable<any>>): number {
  let result
  if (iterable instanceof Array) {
    result = (iterable).length
  } else {
    const iterator = iterable[Symbol.iterator]()
    let count = 0
    let next = iterator.next()
    while (next.done !== true) {
      count++
      next = iterator.next()
    }
    result = count
  }
  return result
}

async function resolveMapOutput<I, O> (
  context: MapExecutionContext<I, O>,
  input: Resolvable<I>,
  index: number
): Promise<null> {
  const mapped = context.mapper(await input, index, context.inputLength)
  context.output[index] = await mapped
  return await buildIterativeMapPromise(context)
}

function buildIterativeMapPromise<I, O> (context: MapExecutionContext<I, O>): Promise<null> | null {
  const nextResult = context.iterator.next()
  if (nextResult.done === true) { return null }
  const index = context.iteratedCount
  context.iteratedCount++
  // We want to distinguish null return value from Promise
  // eslint-disable-next-line @typescript-eslint/return-await
  return resolveMapOutput(context, nextResult.value, index)
}

/**
 * Returns a promise that returns an array of resolved mapped values from `input` iterable
 * using the given `mapper` function.
 *
 * *The `input` iterable is not modified.*
 *
 * @param input Iterable of values to pass to `mapper` function.
 * @param mapper A function which map values returned by iterable to return value.
 */
export async function map<I, O> (
  input: Resolvable<Iterable<Resolvable<I>>>,
  mapper: IterateFunction<I, O>
): Promise<O[]>;

/**
 * Returns a promise that returns an array of resolved mapped values from `input` iterable
 * using the given `mapper` function, with concurrency limit.
 *
 * *The `input` iterable is not modified.*
 *
 * @param input Iterable of values to pass to `mapper` function.
 * @param mapper A function which map values returned by iterable to return value.
 * @param options.concurrency Maximum number of concurrency that can be executed at the same time.
 */
export async function map<I, O> (
  input: Resolvable<Iterable<Resolvable<I>>>,
  mapper: IterateFunction<I, O>,
  options: MapExecutionOptions
): Promise<O[]>;

export async function map<I, O> (
  input: Resolvable<Iterable<Resolvable<I>>>,
  mapper: IterateFunction<I, O>,
  options?: MapExecutionOptions
): Promise<O[]> {
  options = options ?? {}
  let concurrency = options.concurrency ?? Infinity

  const resolvedInput = await input
  const inputLength = getLength(resolvedInput)
  const context: MapExecutionContext<I, O> = {
    iterator: resolvedInput[Symbol.iterator](),
    inputLength,
    iteratedCount: 0,
    mapper,
    output: []
  }
  const concurrentPromises: Array<Promise<null>> = []

  while (concurrency > 0) {
    const p = buildIterativeMapPromise(context)
    if (p !== null) {
      concurrentPromises.push(p)
    } else {
      break
    }
    concurrency--
  }
  await Promise.all(concurrentPromises)
  return context.output
}
