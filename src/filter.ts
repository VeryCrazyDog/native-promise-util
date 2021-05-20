import {
  IterateFunction,
  IteratorExecutionContext,
  Resolvable
} from './types'
import { getLength } from './utils'

export interface FilterExecutionOptions {
  concurrency?: number
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
): Promise<T[]>

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
): Promise<T[]>

export async function filter<T> (
  input: Resolvable<Iterable<Resolvable<T>>>,
  filterer: IterateFunction<T, boolean>,
  options?: FilterExecutionOptions
): Promise<T[]> {
  let availableConcurrency = options?.concurrency ?? Infinity
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
