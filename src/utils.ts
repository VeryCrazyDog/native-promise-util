import type { Resolvable } from './types'

export function getLength (iterable: Iterable<Resolvable<any>>): number {
  let result
  if (iterable instanceof Array) {
    result = iterable.length
  } else if (iterable instanceof Map || iterable instanceof Set) {
    result = iterable.size
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
