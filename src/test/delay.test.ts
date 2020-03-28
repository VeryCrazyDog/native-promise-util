// Import 3rd party modules
import test, { ExecutionContext } from 'ava'

// Import module to be tested
import npu from '../index'

// Private functions
function expectExecTimeAround (t: ExecutionContext, startTime: [number, number], execTime: number): void {
  const ALLOW_RANGE = 50
  const [,endNs] = process.hrtime(startTime)
  const endMs = endNs / 1000000
  t.true(endMs >= execTime, `Expect actual execution time ${endMs} greater than or equal to ${execTime}`)
  t.true(
    endMs <= execTime + ALLOW_RANGE,
    `Expect actual execution time ${endMs} less than or equal to ${execTime + ALLOW_RANGE}`
  )
}

// Test cases
test('delay(ms) should resolved to undefined', async (t) => {
  const output = await npu.delay(1)
  t.is(output, undefined)
})

test('delay(ms) should delay execution', async (t) => {
  const DELAY = 200
  const startTime = process.hrtime()
  await npu.delay(DELAY)
  expectExecTimeAround(t, startTime, DELAY)
})

test('delay(ms, null) should resolved to null', async (t) => {
  const input = null
  const output = await npu.delay(1, input)
  t.is(output, input)
})

test('delay(ms, \'hello\') should resolved to \'hello\'', async (t) => {
  const input = 'hello'
  const output = await npu.delay(1, input)
  t.is(output, input)
})

test('delay(ms, Promise) on string Promise should resolved to \'hello\'', async (t) => {
  const output = await npu.delay(1, Promise.resolve({
    id: 123,
    key: 'value'
  }))
  t.deepEqual(output, {
    id: 123,
    key: 'value'
  })
})

test('delay(ms, Promise) shall delay after Promise resolved', async (t) => {
  const input = 'hello'
  const startTime = process.hrtime()
  const delayJob = new Promise(resolve => {
    setTimeout(() => {
      expectExecTimeAround(t, startTime, 100)
      resolve(input)
    }, 100)
  })
  const output = await npu.delay(200, delayJob)
  expectExecTimeAround(t, startTime, 300)
  t.is(output, input)
})
