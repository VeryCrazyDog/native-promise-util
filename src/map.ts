import type {
  IterateFunction,
  IteratorExecutionContext,
  Resolvable
} from './types'
import { getLength } from './utils'

export interface MapExecutionOptions {
  concurrency?: number
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
): Promise<O[]>

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
): Promise<O[]>

export async function map<I, O> (
  input: Resolvable<Iterable<Resolvable<I>>>,
  mapper: IterateFunction<I, O>,
  options?: MapExecutionOptions
): Promise<O[]> {
  let availableConcurrency = options?.concurrency ?? Infinity
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
