import type {
  IterateFunction,
  Resolvable
} from './types'
import { getLength } from './utils'

export interface EachExecutionOptions {
  inflight?: number
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
): Promise<T[]>

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
): Promise<T[]>

export async function each<T> (
  input: Resolvable<Iterable<Resolvable<T>>>,
  iterator: IterateFunction<T, void>,
  options?: EachExecutionOptions
): Promise<T[]> {
  let maxInflight = options?.inflight ?? 1
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
