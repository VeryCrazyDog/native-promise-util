// Import 3rd party modules
import test, { ExecutionContext } from 'ava'

// Import module to be tested
import { delay, filter } from '../index'

// Variables
const input: number[] = [1, 2, 3]

// Private functions
function assertOutput (t: ExecutionContext, output: number[]): void {
  t.is(output.length, 2)
  t.is(output[0], 1)
  t.is(output[1], 3)
}

// Test cases
// https://github.com/petkaantonov/bluebird/blob/750bd7f87fefaa0f918a6f0a25caec32ffdaddd8/test/mocha/filter.js#L30
test('should accept immediately fulfilled booleans', async (t) => {
  // Keep test case align with original
  // eslint-disable-next-line @typescript-eslint/promise-function-async
  const output = await filter(input, v => {
    // Keep test case align with original
    // eslint-disable-next-line @typescript-eslint/return-await
    return new Promise(resolve => {
      resolve(v !== 2)
    })
  })
  assertOutput(t, output)
})

// https://github.com/petkaantonov/bluebird/blob/750bd7f87fefaa0f918a6f0a25caec32ffdaddd8/test/mocha/filter.js#L38
test('should accept already fulfilled booleans', async (t) => {
  // Keep test case align with original
  // eslint-disable-next-line @typescript-eslint/promise-function-async
  const output = await filter(input, v => {
    // Keep test case align with original
    // eslint-disable-next-line @typescript-eslint/return-await
    return Promise.resolve(v !== 2)
  })
  assertOutput(t, output)
})

// https://github.com/petkaantonov/bluebird/blob/750bd7f87fefaa0f918a6f0a25caec32ffdaddd8/test/mocha/filter.js#L44
test('should accept eventually fulfilled booleans', async (t) => {
  // Keep test case align with original
  // eslint-disable-next-line @typescript-eslint/promise-function-async
  const output = await filter(input, v => {
    // Keep test case align with original
    // eslint-disable-next-line @typescript-eslint/return-await
    return delay(1, v !== 2)
  })
  assertOutput(t, output)
})

// https://github.com/petkaantonov/bluebird/blob/750bd7f87fefaa0f918a6f0a25caec32ffdaddd8/test/mocha/filter.js#L54
test('should accept immediately rejected booleans', async (t) => {
  try {
    // Keep test case align with original
    // eslint-disable-next-line @typescript-eslint/promise-function-async
    await filter(input, v => {
      // Keep test case align with original
      // eslint-disable-next-line @typescript-eslint/return-await
      return new Promise((resolve, reject) => {
        // Make testing easier without checking the error object
        // eslint-disable-next-line prefer-promise-reject-errors
        reject(42)
      })
    })
    t.fail()
  } catch (error) {
    t.is(error, 42)
  }
})

// https://github.com/petkaantonov/bluebird/blob/750bd7f87fefaa0f918a6f0a25caec32ffdaddd8/test/mocha/filter.js#L61
test('should accept already rejected booleans', async (t) => {
  try {
    // Keep test case align with original
    // eslint-disable-next-line @typescript-eslint/promise-function-async
    await filter(input, v => {
      // Keep test case align with original
      // eslint-disable-next-line @typescript-eslint/return-await, prefer-promise-reject-errors
      return Promise.reject(42)
    })
    t.fail()
  } catch (error) {
    t.is(error, 42)
  }
})

// https://github.com/petkaantonov/bluebird/blob/750bd7f87fefaa0f918a6f0a25caec32ffdaddd8/test/mocha/filter.js#L66
test('should accept eventually rejected booleans', async (t) => {
  try {
    // Keep test case align with original
    // eslint-disable-next-line @typescript-eslint/promise-function-async
    await filter(input, v => {
      // Keep test case align with original
      // eslint-disable-next-line @typescript-eslint/return-await
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          // eslint-disable-next-line prefer-promise-reject-errors
          reject(42)
        }, 1)
      })
    })
    t.fail()
  } catch (error) {
    t.is(error, 42)
  }
})
