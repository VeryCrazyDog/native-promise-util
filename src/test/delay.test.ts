// Import 3rd party modules
import type { EitherMacro, ExecutionContext } from 'ava'
import test from 'ava'

// Import module to be tested
import type { Resolvable } from '../index'
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
// https://github.com/petkaantonov/bluebird/blob/49da1ac256c7ee0fb1e07679791399f24648b933/test/mocha/timers.js#L148
test('should not delay rejection', async t => {
  let isDone = false
  // Keep test case align with original
  // eslint-disable-next-line prefer-promise-reject-errors
  const promise = delay(1, Promise.reject(5))
  promise.then(t.fail.bind(t), () => {}).finally(() => {
    isDone = true
  })
  await delay(1)
  t.is(isDone, true)
})

// https://github.com/petkaantonov/bluebird/blob/49da1ac256c7ee0fb1e07679791399f24648b933/test/mocha/timers.js#L158
test('should delay after resolution', async t => {
  const promise1 = delay(1, 'what')
  const promise2 = delay(1, promise1)
  const value = await promise2
  t.is(value, 'what')
})

// https://github.com/petkaantonov/bluebird/blob/49da1ac256c7ee0fb1e07679791399f24648b933/test/mocha/timers.js#L167
test("should resolve follower promise's value", async t => {
  let resolveFn: undefined | ((value: Resolvable<number>) => void)
  const promise1 = new Promise<number>(resolve => {
    resolveFn = resolve
  })
  const promise2 = new Promise<number>(resolve => {
    setTimeout(() => {
      resolve(3)
    }, 1)
  })
  if (resolveFn === undefined) { t.fail(); return }
  resolveFn(promise2)
  const value = await delay(1, promise1)
  t.is(value, 3)
})

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
