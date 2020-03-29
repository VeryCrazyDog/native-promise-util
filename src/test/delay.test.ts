// Import 3rd party modules
import test, { ExecutionContext } from 'ava'

// Import module to be tested
import { delay } from '../index'

// Private functions
function expectExecTimeAround (t: ExecutionContext, startTime: [number, number], execTime: number): void {
  const ALLOW_RANGE = 50
  const [, endNs] = process.hrtime(startTime)
  const endMs = endNs / 1000000
  t.true(endMs >= execTime, `Expect actual execution time ${endMs} greater than or equal to ${execTime}`)
  t.true(
    endMs <= execTime + ALLOW_RANGE,
    `Expect actual execution time ${endMs} less than or equal to ${execTime + ALLOW_RANGE}`
  )
}

// Test cases
test('should resolved to undefined when no value is passed', async (t) => {
  const output = await delay(1)
  t.is(output, undefined)
})

test('should delay execution', async (t) => {
  const DELAY = 200
  const startTime = process.hrtime()
  await delay(DELAY)
  expectExecTimeAround(t, startTime, DELAY)
})

test('should resolved to null when null is passed', async (t) => {
  const input = null
  const output = await delay<null>(1, input)
  t.is(output, input)
})

test('should resolved to \'hello\' when \'hello\' is passed', async (t) => {
  const input = 'hello'
  const output = await delay<string>(1, input)
  t.is(output, input)
})

test('should resolved to KeyValuePair when promise of KeyValuePair is passed', async (t) => {
  interface KeyValuePair {
    id: number
    key: string
  }
  const output = await delay<KeyValuePair>(1, Promise.resolve({
    id: 123,
    key: 'value'
  }))
  t.deepEqual(output, {
    id: 123,
    key: 'value'
  })
})

test('should delay return after promise resolved', async (t) => {
  const input = 'hello'
  const startTime = process.hrtime()
  const delayJob = new Promise<string>(resolve => {
    setTimeout(() => {
      expectExecTimeAround(t, startTime, 100)
      resolve(input)
    }, 100)
  })
  const output = await delay<string>(200, delayJob)
  expectExecTimeAround(t, startTime, 300)
  t.is(output, input)
})
