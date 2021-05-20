export type Resolvable<R> = R | PromiseLike<R>;
export type IterateFunction<I, O> = (item: I, index: number, length: number) => Resolvable<O>;

export interface MapExecutionOptions {
  concurrency?: number
}
export interface MapSeriesExecutionOptions {
  inflight?: number
}
export interface EachExecutionOptions {
  inflight?: number
}
export interface FilterExecutionOptions {
  concurrency?: number
}

interface IteratorExecutionContext<I, O> {
  iterator: Iterator<Resolvable<I>>
  inputLength: number
  iteratedCount: number
  output: O[]
}

function getLength (iterable: Iterable<Resolvable<any>>): number {
  let result
  if (iterable instanceof Array) {
    result = iterable.length
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

async function buildMapExecWorker<I, O> (
  context: IteratorExecutionContext<I, O>,
  mapper: IterateFunction<I, O>
): Promise<void> {
  let nextResult = context.iterator.next()
  while (nextResult.done !== true) {
    const index = context.iteratedCount
    context.iteratedCount++
    const mapped = mapper(await nextResult.value, index, context.inputLength)
    context.output[index] = await mapped
    nextResult = context.iterator.next()
  }
}

/**
 * Returns a promise that returns an array of resolved mapped values from `input` iterable
 * using the given `mapper` function.
 *
 * *The `input` iterable is not modified.*
 *
 * @param input Iterable of resolvable values to pass to `mapper` function.
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
 * @param input Iterable of resolvable values to pass to `mapper` function.
 * @param mapper A function which map values returned by iterable to return value.
 * @param options.concurrency Maximum number of concurrency that can be executed at
 *   the same time. Default is `Infinity`.
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
  let availableConcurrency = options.concurrency ?? Infinity
  if (availableConcurrency < 1) {
    availableConcurrency = 1
  }

  const resolvedInput = await input
  const context: IteratorExecutionContext<I, O> = {
    iterator: resolvedInput[Symbol.iterator](),
    inputLength: getLength(resolvedInput),
    iteratedCount: 0,
    output: []
  }
  let availableInput = context.inputLength

  const workers: Array<Promise<void>> = []
  while (availableConcurrency > 0 && availableInput > 0) {
    workers.push(buildMapExecWorker(context, mapper))
    availableInput--
    availableConcurrency--
  }
  await Promise.all(workers)
  return context.output
}

/**
 * Returns a promise that returns an array of resolved mapped values from `input` iterable
 * using the given `mapper` function executed in series.
 *
 * *The `input` iterable is not modified.*
 *
 * @param input Iterable of resolvable values to pass to `mapper` function.
 * @param mapper A function which map values returned by iterable to return value.
 */
export async function mapSeries<I, O> (
  input: Resolvable<Iterable<Resolvable<I>>>,
  mapper: IterateFunction<I, O>
): Promise<O[]>;

/**
 * Returns a promise that returns an array of resolved mapped values from `input` iterable
 * using the given `mapper` function. `mapper` function execution is started in series
 * with a maximum number of executing limit.
 *
 * *The `input` iterable is not modified.*
 *
 * @param input Iterable of resolvable values to pass to `mapper` function.
 * @param mapper A function which map values returned by iterable to return value.
 * @param options.inflight Maximum number of inflight limit that can be executed at the same time. Default is `1`.
 */
export async function mapSeries<I, O> (
  input: Resolvable<Iterable<Resolvable<I>>>,
  mapper: IterateFunction<I, O>,
  options: MapSeriesExecutionOptions
): Promise<O[]>;

export async function mapSeries<I, O> (
  input: Resolvable<Iterable<Resolvable<I>>>,
  mapper: IterateFunction<I, O>,
  options?: MapSeriesExecutionOptions
): Promise<O[]> {
  options = options ?? {}
  let maxInflight = options.inflight ?? 1
  if (maxInflight < 1) {
    maxInflight = 1
  }

  const resolvedInput = await input
  const inputLength = getLength(resolvedInput)
  const iterator = resolvedInput[Symbol.iterator]()
  let iteratedCount = 0
  const inflights: Array<Resolvable<O>> = []
  const output: O[] = []

  let nextItem = iterator.next()
  if (maxInflight < 2) {
    // Provides a higher performance implementation without push() and shift()
    while (nextItem.done !== true) {
      const index = iteratedCount
      iteratedCount++
      output.push(await mapper(await nextItem.value, index, inputLength))
      nextItem = iterator.next()
    }
  } else {
    while (nextItem.done !== true) {
      const index = iteratedCount
      iteratedCount++
      if (inflights.length >= maxInflight) {
        // shift() will never return undefined because array length is checked
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        output.push((await inflights.shift())!)
      }
      inflights.push(mapper(await nextItem.value, index, inputLength))
      nextItem = iterator.next()
    }
    while (inflights.length > 0) {
      // shift() will never return undefined because array length is checked
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      output.push((await inflights.shift())!)
    }
  }
  return output
}

/**
 * Returns a promise that returns an array of resolved values from `input` iterable.
 * Each resolved value are passed to `iterator` function in series for execution.
 *
 * *The `input` iterable is not modified.*
 *
 * @param input Iterable of resolvable values to pass to `iterator` function.
 * @param iterator A function which will be executed on the resolved value from `input` iterable.
 */
export async function each<T> (
  input: Resolvable<Iterable<Resolvable<T>>>,
  iterator: IterateFunction<T, void>
): Promise<T[]>;

/**
 * Returns a promise that returns an array of resolved values from `input` iterable.
 * Each resolved value are passed to `iterator` function in series for async execution
 * with a maximum number of `options.inflight` async execution limit.
 *
 * *The `input` iterable is not modified.*
 *
 * @param input Iterable of resolvable values to pass to `iterator` function.
 * @param iterator A function which will be executed on the resolved value from `input` iterable.
 * @param options.inflight Maximum number of inflight limit that can be executed at the same time. Default is `1`.
 */
export async function each<T> (
  input: Resolvable<Iterable<Resolvable<T>>>,
  iterator: IterateFunction<T, void>,
  options: EachExecutionOptions
): Promise<T[]>;

export async function each<T> (
  input: Resolvable<Iterable<Resolvable<T>>>,
  iterator: IterateFunction<T, void>,
  options?: EachExecutionOptions
): Promise<T[]> {
  options = options ?? {}
  let maxInflight = options.inflight ?? 1
  if (maxInflight < 1) {
    maxInflight = 1
  }

  const resolvedInput = await input
  const inputLength = getLength(resolvedInput)
  const inputIterator = resolvedInput[Symbol.iterator]()
  let iteratedCount = 0
  const inflights: Array<Resolvable<void>> = []
  const output: T[] = []

  let nextItem = inputIterator.next()
  if (maxInflight < 2) {
    // Provides a higher performance implementation without push() and shift()
    while (nextItem.done !== true) {
      const index = iteratedCount
      iteratedCount++
      const resolvedItem = await nextItem.value
      await iterator(resolvedItem, index, inputLength)
      output.push(resolvedItem)
      nextItem = inputIterator.next()
    }
  } else {
    while (nextItem.done !== true) {
      const index = iteratedCount
      iteratedCount++
      if (inflights.length >= maxInflight) {
        await inflights.shift()
      }
      const resolvedItem = await nextItem.value
      inflights.push(iterator(resolvedItem, index, inputLength))
      output.push(resolvedItem)
      nextItem = inputIterator.next()
    }
    while (inflights.length > 0) {
      await inflights.shift()
    }
  }
  return output
}

async function buildFilterExecWorker<T> (
  context: IteratorExecutionContext<T, T>,
  filterer: IterateFunction<T, boolean>
): Promise<void> {
  let nextResult = context.iterator.next()
  while (nextResult.done !== true) {
    const index = context.iteratedCount
    context.iteratedCount++
    const resolvedNextResult = await nextResult.value
    const shouldInclude = await filterer(resolvedNextResult, index, context.inputLength)
    // Do not change to `shouldInclude === true` which will not accept truthy value
    // Although only boolean is accepted in TypeScript, user of this module may be coded in JavaScript
    if (shouldInclude) {
      context.output.push(resolvedNextResult)
    }
    nextResult = context.iterator.next()
  }
}

/**
 * Returns a promise that returns an array of filtered resolved values from `input` iterable.
 * Values from `input` iterable is resolved before filtered by the given `filterer` function.
 *
 * *The `input` iterable is not modified.*
 *
 * @param input Iterable of resolvable values to pass to `filterer` function.
 * @param filterer A function which return true for filter in values returned by iterable.
 */
export async function filter<T> (
  input: Resolvable<Iterable<Resolvable<T>>>,
  filterer: IterateFunction<T, boolean>
): Promise<T[]>;

/**
 * Returns a promise that returns an array of filtered resolved values from `input` iterable
 * with given concurrency. Values from `input` iterable is resolved before filtered by
 * the given `filterer` function.
 *
 * *The `input` iterable is not modified.*
 *
 * @param input Iterable of resolvable values to pass to `mapper` function.
 * @param filterer A function which return true for filter in values returned by iterable.
 * @param options.concurrency Maximum number of concurrency that can be executed at
 *   the same time. Default is `Infinity`.
 */
export async function filter<T> (
  input: Resolvable<Iterable<Resolvable<T>>>,
  filterer: IterateFunction<T, boolean>,
  options: FilterExecutionOptions
): Promise<T[]>;

export async function filter<T> (
  input: Resolvable<Iterable<Resolvable<T>>>,
  filterer: IterateFunction<T, boolean>,
  options?: FilterExecutionOptions
): Promise<T[]> {
  options = options ?? {}
  let availableConcurrency = options.concurrency ?? Infinity
  if (availableConcurrency < 1) {
    availableConcurrency = 1
  }

  const resolvedInput = await input
  const context: IteratorExecutionContext<T, T> = {
    iterator: resolvedInput[Symbol.iterator](),
    inputLength: getLength(resolvedInput),
    iteratedCount: 0,
    output: []
  }
  let availableInput = context.inputLength

  const workers: Array<Promise<void>> = []
  while (availableConcurrency > 0 && availableInput > 0) {
    workers.push(buildFilterExecWorker(context, filterer))
    availableInput--
    availableConcurrency--
  }
  await Promise.all(workers)
  return context.output
}
