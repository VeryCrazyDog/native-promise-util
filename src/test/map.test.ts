// Import 3rd party modules
import test from 'ava'

// Import module to be tested
import { delay, map } from '../index'

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
  const specialMapper = (): void => {
    calls++
  }
  const input = [1, Promise.resolve(2), 3]
  const p = map(input, specialMapper)
  t.is(calls, 0)
  await p
  t.is(calls, 3)
})
