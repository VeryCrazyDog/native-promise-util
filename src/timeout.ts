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

export async function timeout<T = never> (ms: number, message?: string): Promise<T>
export async function timeout<T> (ms: number, message?: string, value?: Resolvable<T>): Promise<T>
export async function timeout<T = never> (ms: number, error?: Error): Promise<T>
export async function timeout<T> (ms: number, error?: Error, value?: Resolvable<T>): Promise<T>

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
    let resolved = false
    const timer = setTimeout(() => {
      if (resolved) { return }
      reject(buildTimeoutError(messageOrError))
      resolved = true
    }, ms)
    ;(async () => {
      const resolvedValue = await value
      clearTimeout(timer)
      if (resolved) { return }
      resolve(resolvedValue)
      resolved = true
    })().catch(() => {})
  })
}
