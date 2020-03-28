// Import 3rd party modules
import test from 'ava'

// Import module to be tested
import npu from '../index'

// Test cases
test('delay(ms) should return Promise', t => {
  const retval = npu.delay(1)
  t.true(retval instanceof Promise)
})

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
