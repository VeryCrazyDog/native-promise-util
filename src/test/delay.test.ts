// Import 3rd party modules
import test, { EitherMacro, ExecutionContext } from 'ava'

// Import module to be tested
import { delay } from '../index'

// Private functions
async function tryUntilAttempt<C, A> (t: ExecutionContext<C>, fn: EitherMacro<A[], C>, attempt: number): Promise<void> {
  for (let i = 1; i <= attempt; i++) {
    const tryResult = await t.try(fn)
    if (tryResult.passed) {
      tryResult.commit()
      break
    } else if (i !== attempt) {
      tryResult.discard()
    } else {
      tryResult.commit()
    }
  }
}

function assertExecTimeAround (t: ExecutionContext, execTime: number, startTime: bigint, endTime: bigint): void {
  const ALLOW_RANGE_LOWER = 10
  const ALLOW_RANGE_UPPER = 25
  const diffNs = endTime - startTime
  const diffMs = diffNs / BigInt(1000000)
  const lowerAllowed = execTime - ALLOW_RANGE_LOWER
  const upperAllowed = execTime + ALLOW_RANGE_UPPER
  t.true(
    diffMs >= lowerAllowed,
    `Expect actual execution time ${diffMs} greater than or equal to ${lowerAllowed}`
  )
  t.true(
    diffMs <= upperAllowed,
    `Expect actual execution time ${diffMs} less than or equal to ${upperAllowed}`
  )
}

// Test cases
test('should resolved to undefined when no value is passed', async t => {
  const output = await delay(1)
  t.is(output, undefined)
})

test('should delay execution', async t => {
  const DELAY = 200
  await tryUntilAttempt(t, async tt => {
    const startTime = process.hrtime.bigint()
    await delay(DELAY)
    const endTime = process.hrtime.bigint()
    assertExecTimeAround(tt, DELAY, startTime, endTime)
  }, 3)
})

test('should resolved to null when null is passed', async t => {
  const input = null
  const output = await delay<null>(1, input)
  t.is(output, input)
})

test('should resolved to \'hello\' when \'hello\' is passed', async t => {
  const input = 'hello'
  const output = await delay<string>(1, input)
  t.is(output, input)
})

test('should resolved to KeyValuePair when promise of KeyValuePair is passed', async t => {
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

test('should delay return after promise resolved', async t => {
  await tryUntilAttempt(t, async tt => {
    const input = 'hello'
    const startTime = process.hrtime.bigint()
    const delayJob = new Promise<string>(resolve => {
      setTimeout(() => {
        const endTime = process.hrtime.bigint()
        assertExecTimeAround(tt, 100, startTime, endTime)
        resolve(input)
      }, 100)
    })
    const output = await delay<string>(200, delayJob)
    const endTime = process.hrtime.bigint()
    assertExecTimeAround(tt, 300, startTime, endTime)
    tt.is(output, input)
  }, 3)
})
