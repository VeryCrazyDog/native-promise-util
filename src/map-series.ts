import type {
  IterateFunction,
  Resolvable
} from './types'
import { getLength } from './utils'

export interface MapSeriesExecutionOptions {
  inflight?: number
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
): Promise<O[]>

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
): Promise<O[]>

export async function mapSeries<I, O> (
  input: Resolvable<Iterable<Resolvable<I>>>,
  mapper: IterateFunction<I, O>,
  options?: MapSeriesExecutionOptions
): Promise<O[]> {
  let maxInflight = options?.inflight ?? 1
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
