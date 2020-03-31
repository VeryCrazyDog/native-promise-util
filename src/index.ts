export type Resolvable<R> = R | PromiseLike<R>;
export type IterateFunction<I, O> = (item: I, index: number, length: number) => Resolvable<O>;

export interface MapExecutionOptions {
  concurrency?: number
}
export interface FilterExecutionOptions {
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

interface IteratorExecutionContext<I, O> {
  iterator: Iterator<Resolvable<I>>
  inputLength: number
  iteratedCount: number
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
  let availableConcurrency = options.concurrency ?? Infinity

  const resolvedInput = await input
  const context: IteratorExecutionContext<I, O> = {
    iterator: resolvedInput[Symbol.iterator](),
    inputLength: getLength(resolvedInput),
    iteratedCount: 0,
    output: []
  }
  let availableInput = context.inputLength

  const workers: Array<Promise<void>> = []
  while (availableInput > 0 && availableConcurrency > 0) {
    workers.push(buildMapExecWorker(context, mapper))
    availableInput--
    availableConcurrency--
  }
  await Promise.all(workers)
  return context.output
}

interface FilterExecutionContext<T> {
  iterator: Iterator<Resolvable<T>>
  inputLength: number
  iteratedCount: number
  filterer: IterateFunction<T, boolean>
  output: T[]
}

async function resolveFilterOutput<T> (
  context: FilterExecutionContext<T>,
  input: Resolvable<T>,
  index: number
): Promise<null> {
  const resolvedInput = await input
  const shouldInclude = context.filterer(resolvedInput, index, context.inputLength)
  if (await shouldInclude) {
    context.output.push(resolvedInput)
  }
  return await buildIterativeFilterPromise(context)
}

function buildIterativeFilterPromise<T> (context: FilterExecutionContext<T>): Promise<null> | null {
  const nextResult = context.iterator.next()
  if (nextResult.done === true) { return null }
  const index = context.iteratedCount
  context.iteratedCount++
  // We want to distinguish null return value from Promise
  // eslint-disable-next-line @typescript-eslint/return-await
  return resolveFilterOutput(context, nextResult.value, index)
}

// TODO Implement, stub only
export async function filter<T> (
  input: Resolvable<Iterable<Resolvable<T>>>,
  filterer: IterateFunction<T, boolean>,
  options?: FilterExecutionOptions
): Promise<T[]> {
  options = options ?? {}
  let concurrency = options.concurrency ?? Infinity

  const resolvedInput = await input
  const inputLength = getLength(resolvedInput)
  const context: FilterExecutionContext<T> = {
    iterator: resolvedInput[Symbol.iterator](),
    inputLength,
    iteratedCount: 0,
    filterer,
    output: []
  }
  const concurrentPromises: Array<Promise<null>> = []

  while (concurrency > 0) {
    const p = buildIterativeFilterPromise(context)
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
