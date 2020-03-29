type Resolvable<R> = R | PromiseLike<R>;
type IterateFunction<T, R> = (item: T, index: number, length: number) => Resolvable<R>;

interface ConcurrencyOption {
  concurrency?: number
}
interface MapExecutionContext<I, O> {
  iterator: Iterator<Resolvable<I>>
  inputLength: number
  iteratedCount: number
  mapper: IterateFunction<I, O>
  output: O[]
}

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

export async function delay<T> (ms: number, value?: Resolvable<T>): Promise<T | undefined> {
  const result = await value
  await new Promise(resolve => setTimeout(resolve, ms))
  return result
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

async function resolveOutput<I, O> (
  context: MapExecutionContext<I, O>,
  input: Resolvable<I>,
  index: number
): Promise<null> {
  const mapped = context.mapper(await input, index, context.inputLength)
  context.output[index] = await mapped
  return await buildIterativePromise(context)
}

function buildIterativePromise<I, O> (context: MapExecutionContext<I, O>): Promise<null> | null {
  const nextResult = context.iterator.next()
  if (nextResult.done === true) { return null }
  const index = context.iteratedCount
  context.iteratedCount++
  // We want to distinguish null return value from Promise
  // eslint-disable-next-line @typescript-eslint/return-await
  return resolveOutput(context, nextResult.value, index)
}

export async function map<I, O> (
  input: Resolvable<Iterable<Resolvable<I>>>,
  mapper: IterateFunction<I, O>,
  options?: ConcurrencyOption
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
    const p = buildIterativePromise(context)
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
