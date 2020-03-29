// Import 3rd party modules
import test from 'ava'

// Import module to be tested
import { delay, map } from '../index'

// Variables
const concurrency = { concurrency: 2 }

// Private functions
function mapper (val: number): number {
  return val * 2
}

async function deferredMapper (val: number): Promise<number> {
  return await delay(1, mapper(val))
}

// Test cases
// https://github.com/petkaantonov/bluebird/blob/3a39c11ab77299a163e9504e77f498118d0c3263/test/mocha/map.js#L41
test('should map input values array', async (t) => {
  const input = [1, 2, 3]
  t.deepEqual(await map(input, mapper), [2, 4, 6])
})

// https://github.com/petkaantonov/bluebird/blob/3a39c11ab77299a163e9504e77f498118d0c3263/test/mocha/map.js#L51
test('should map input promises array', async (t) => {
  const input = [Promise.resolve(1), Promise.resolve(2), Promise.resolve(3)]
  t.deepEqual(await map(input, mapper), [2, 4, 6])
})

// https://github.com/petkaantonov/bluebird/blob/3a39c11ab77299a163e9504e77f498118d0c3263/test/mocha/map.js#L61
test('should map mixed input array', async (t) => {
  const input = [1, Promise.resolve(2), 3]
  t.deepEqual(await map(input, mapper), [2, 4, 6])
})

// https://github.com/petkaantonov/bluebird/blob/3a39c11ab77299a163e9504e77f498118d0c3263/test/mocha/map.js#L71
test('should map input when mapper returns a promise', async (t) => {
  const input = [1, 2, 3]
  t.deepEqual(await map(input, deferredMapper), [2, 4, 6])
})

// https://github.com/petkaantonov/bluebird/blob/3a39c11ab77299a163e9504e77f498118d0c3263/test/mocha/map.js#L81
test('should accept a promise for an array', async (t) => {
  const input = Promise.resolve([1, Promise.resolve(2), 3])
  t.deepEqual(await map(input, mapper), [2, 4, 6])
})

// https://github.com/petkaantonov/bluebird/blob/3a39c11ab77299a163e9504e77f498118d0c3263/test/mocha/map.js#L95
test('should map input promises when mapper returns a promise', async (t) => {
  const input = Promise.resolve([Promise.resolve(1), Promise.resolve(2), Promise.resolve(3)])
  t.deepEqual(await map(input, mapper), [2, 4, 6])
})

// https://github.com/petkaantonov/bluebird/blob/3a39c11ab77299a163e9504e77f498118d0c3263/test/mocha/map.js#L105
test('should reject when input contains rejection', async (t) => {
  // Make testing easier without checking the error object
  // eslint-disable-next-line prefer-promise-reject-errors
  const input = Promise.resolve([Promise.resolve(1), Promise.reject(2), Promise.resolve(3)])
  try {
    await map(input, mapper)
    t.fail()
  } catch (error) {
    t.is(error, 2)
  }
})

// https://github.com/petkaantonov/bluebird/blob/3a39c11ab77299a163e9504e77f498118d0c3263/test/mocha/map.js#L115
test('should call mapper asynchronously on values array', async (t) => {
  let calls = 0
  const specialMapper = (): void => {
    calls++
  }
  const input = [1, 2, 3]
  const p = map(input, specialMapper)
  t.is(calls, 0)
  await p
  t.is(calls, 3)
})

// https://github.com/petkaantonov/bluebird/blob/3a39c11ab77299a163e9504e77f498118d0c3263/test/mocha/map.js#L129
test('should call mapper asynchronously on promises array', async (t) => {
  let calls = 0
  const specialMapper = (): void => {
    calls++
  }
  const input = [Promise.resolve(1), Promise.resolve(2), Promise.resolve(3)]
  const p = map(input, specialMapper)
  t.is(calls, 0)
  await p
  t.is(calls, 3)
})

// https://github.com/petkaantonov/bluebird/blob/3a39c11ab77299a163e9504e77f498118d0c3263/test/mocha/map.js#L143
test('should call mapper asynchronously on mixed array', async (t) => {
  let calls = 0
  function specialMapper (): void {
    calls++
  }
  const input = [1, Promise.resolve(2), 3]
  const p = map(input, specialMapper)
  t.is(calls, 0)
  await p
  t.is(calls, 3)
})

// https://github.com/petkaantonov/bluebird/blob/3a39c11ab77299a163e9504e77f498118d0c3263/test/mocha/map.js#L170
test('should map input values array with concurrency', async (t) => {
  const input = [1, 2, 3]
  t.deepEqual(await map(input, mapper, concurrency), [2, 4, 6])
})

// https://github.com/petkaantonov/bluebird/blob/3a39c11ab77299a163e9504e77f498118d0c3263/test/mocha/map.js#L180
test('should map input promises array with concurrency', async (t) => {
  const input = [Promise.resolve(1), Promise.resolve(2), Promise.resolve(3)]
  t.deepEqual(await map(input, mapper, concurrency), [2, 4, 6])
})

// https://github.com/petkaantonov/bluebird/blob/3a39c11ab77299a163e9504e77f498118d0c3263/test/mocha/map.js#L190
test('should map mixed input array with concurrency', async (t) => {
  const input = [1, Promise.resolve(2), 3]
  t.deepEqual(await map(input, mapper, concurrency), [2, 4, 6])
})

// https://github.com/petkaantonov/bluebird/blob/3a39c11ab77299a163e9504e77f498118d0c3263/test/mocha/map.js#L200
test('should map input when mapper returns a promise with concurrency', async (t) => {
  const input = [1, 2, 3]
  t.deepEqual(await map(input, deferredMapper, concurrency), [2, 4, 6])
})

// https://github.com/petkaantonov/bluebird/blob/3a39c11ab77299a163e9504e77f498118d0c3263/test/mocha/map.js#L210
test('should accept a promise for an array with concurrency', async (t) => {
  const input = Promise.resolve([1, Promise.resolve(2), 3])
  t.deepEqual(await map(input, mapper, concurrency), [2, 4, 6])
})

// https://github.com/petkaantonov/bluebird/blob/3a39c11ab77299a163e9504e77f498118d0c3263/test/mocha/map.js#L224
test('should map input promises when mapper returns a promise with concurrency', async (t) => {
  const input = [Promise.resolve(1), Promise.resolve(2), Promise.resolve(3)]
  t.deepEqual(await map(input, mapper, concurrency), [2, 4, 6])
})

// https://github.com/petkaantonov/bluebird/blob/3a39c11ab77299a163e9504e77f498118d0c3263/test/mocha/map.js#L234
test('should reject when input contains rejection with concurrency', async (t) => {
  // Make testing easier without checking the error object
  // eslint-disable-next-line prefer-promise-reject-errors
  const input = Promise.resolve([Promise.resolve(1), Promise.reject(2), Promise.resolve(3)])
  try {
    await map(input, mapper, concurrency)
    t.fail()
  } catch (error) {
    t.is(error, 2)
  }
})

// https://github.com/petkaantonov/bluebird/blob/3a39c11ab77299a163e9504e77f498118d0c3263/test/mocha/map.js#L244
test.skip('should not have more than {concurrency} promises in flight', async (t) => {
  type ResolveFunction = (value?: any) => void
  interface DelayPromiseInfo {
    promise: Promise<any>
    resolve: ResolveFunction
    index: number
  }

  const input: number[] = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
  const output: number[] = []

  const immediates: DelayPromiseInfo[] = []
  async function immediate (index: number): Promise<any> {
    let resolveFunc: ResolveFunction = () => {}
    const promise = new Promise(resolve => {
      resolveFunc = resolve
    })
    immediates.push({
      promise,
      resolve: resolveFunc,
      index
    })
    return await promise
  }

  const lates: DelayPromiseInfo[] = []
  async function late (index: number): Promise<any> {
    let resolveFunc: ResolveFunction = () => {}
    const promise = new Promise(resolve => {
      resolveFunc = resolve
    })
    lates.push({
      promise,
      resolve: resolveFunc,
      index
    })
    return await promise
  }

  async function promiseByIndex (index: number): Promise<any> {
    return await (index < 5 ? immediate(index) : late(index))
  }

  function realResolve (delayInfo: DelayPromiseInfo): void {
    delayInfo.resolve(delayInfo.index)
  }

  const ret1 = map(input, async (value, index) => {
    await promiseByIndex(index)
    output.push(value)
  }, { concurrency: 5 })

  const ret2 = (async () => {
    await delay(100)
    t.is(0, output.length)
    immediates.forEach(realResolve)
    await immediates.map(async item => await item.promise)
    await delay(100)
    t.deepEqual(output, [0, 1, 2, 3, 4])
    lates.forEach(realResolve)
    await delay(100)
    t.deepEqual(output, [0, 1, 2, 3, 4, 10, 9, 8, 7, 6])
    lates.forEach(realResolve)
    await ret1
    t.deepEqual(output, [0, 1, 2, 3, 4, 10, 9, 8, 7, 6, 5])
  })()
  await Promise.all([ret1, ret2])
})

test('should pass correct arguments to mapper', async (t) => {
  const input = [30, 31, 32]
  t.deepEqual(await map(input, (item, index, length) => {
    t.is(item % 30, index)
    t.is(length, input.length)
    return item * item
  }), [30 * 30, 31 * 31, 32 * 32])
})
