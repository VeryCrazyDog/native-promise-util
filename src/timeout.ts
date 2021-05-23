import { Resolvable } from './types'
import { TimeoutError } from './errors'

const ERRMSG_TIMEOUT_ERROR = 'operation timed out'

function buildTimeoutError (messageOrError?: string | Error): Error {
  let err: Error
  if (typeof messageOrError !== 'string') {
    if (messageOrError instanceof Error) {
      err = messageOrError
    } else {
      err = new TimeoutError(ERRMSG_TIMEOUT_ERROR)
    }
  } else {
    err = new TimeoutError(messageOrError)
  }
  return err
}

// Returns a promise that will be fulfilled with `value` promise's fulfillment value or
// rejection reason. However, if `value` promise is not fulfilled or rejected within
// `ms` milliseconds, or if `value` promise is not provided and `ms` milliseconds passed,
// the returned promise is rejected with a `TimeoutError` or the `error` as the reason.

/**
 * Returns a promise that will be fulfilled with `value` promise's fulfillment value or
 * rejection reason. However, if `value` promise is not fulfilled or rejected within
 * `ms` milliseconds, the returned promise is rejected with a `TimeoutError` using given
 * `message` as the reason.
 * @param ms Timeout in milliseconds.
 * @param message Error message of the `TimeoutError` to be rejected with. Default is `operation timed out`.
 * @param value Value to be resolved to or a promise-like object to be fulfilled.
 */
export function timeout<T> (ms: number, message: string | undefined, value: Resolvable<T>): Promise<T>
/**
 * Returns a promise that will be fulfilled with `value` promise's fulfillment value or
 * rejection reason. However, if `value` promise is not fulfilled or rejected within
 * `ms` milliseconds, the returned promise is rejected with the given `error` as the reason.
 * @param ms Timeout in milliseconds.
 * @param error Error to be rejected with.
 * @param value Value to be resolved to or a promise-like object to be fulfilled.
 */
export function timeout<T> (ms: number, error: Error, value: Resolvable<T>): Promise<T>

/**
 * Returns a promise that will be rejected with `TimeoutError` after given `ms` milliseconds.
 * @param ms Timeout in milliseconds.
 * @param message Error message of the `TimeoutError` to be rejected with. Default is `operation timed out`.
 */
export function timeout<T = never> (ms: number, message?: string): Promise<T>
/**
 * Returns a promise that will be rejected with given `error` after given `ms` milliseconds.
 * @param ms Timeout in milliseconds.
 * @param error Error to be rejected with.
 */
export function timeout<T = never> (ms: number, error: Error): Promise<T>

// eslint-disable-next-line @typescript-eslint/promise-function-async
export function timeout<T> (
  ms: number,
  messageOrError?: string | Error,
  value?: Resolvable<T>
): Promise<undefined | T> {
  if (value === undefined) {
    // eslint-disable-next-line promise/param-names, @typescript-eslint/return-await
    return new Promise<never>((_resolve, reject) => setTimeout(() => {
      reject(buildTimeoutError(messageOrError))
    }, ms))
  }
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(buildTimeoutError(messageOrError))
    }, ms)
    ;(async () => {
      try {
        const resolvedValue = await value
        resolve(resolvedValue)
      } catch (error) {
        reject(error)
      } finally {
        clearTimeout(timer)
      }
    })().catch(() => {})
  })
}
