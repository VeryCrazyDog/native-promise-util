// Import 3rd party modules
import test from 'ava'

// Import module to be tested
import npu from '../index'

// Test cases
test('delay(ms) should resolved to undefined', async (t) => {
  const retval = await npu.delay(1)
  t.is(retval, undefined)
})

test('delay(ms) should delay execution', async (t) => {
  const DELAY = 200
  const ALLOW_RANGE = 50
  const startTime = process.hrtime()
  await npu.delay(DELAY)
  const [,endNs] = process.hrtime(startTime)
  const endMs = endNs / 1000000
  t.true(endMs >= DELAY, `Expect actual execution time ${endMs} greater than or equal to ${DELAY}`)
  t.true(
    endMs <= DELAY + ALLOW_RANGE,
    `Expect actual execution time ${endMs} less than or equal to ${DELAY + ALLOW_RANGE}`
  )
})

test('delay(ms, null) should resolved to null', async (t) => {
  const input = null
  const retval = await npu.delay(1, input)
  t.is(retval, input)
})

test(`delay(ms, 'hello') should resolved to 'hello'`, async (t) => {
  const input = 'hello'
  const retval = await npu.delay(1, input)
  t.is(retval, input)
})

test(`delay(ms, Promise) on string Promise should resolved to 'hello'`, async (t) => {
  const retval = await npu.delay(1, Promise.resolve({
    id: 123,
    key: 'value'
  }))
  t.deepEqual(retval, {
    id: 123,
    key: 'value'
  })
})

// test(`delay(ms, Promise) shall delay after Promise resolved`, async (t) => {
//   const input = 'hello'
//   const delayJob = new Promise(resolve => {
//     setTimeout(() => {
//       resolve(input)
//     }, 100);
//   })
//   const retval = npu.delay(200, delayJob)
//   const output = await retval
//   t.is(output, input)
// })
