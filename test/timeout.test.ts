// Import 3rd party modules
import test from 'ava'

// Import module to be tested
import { TimeoutError, delay, timeout } from '../src/index'

// Test cases
// https://github.com/petkaantonov/bluebird/blob/49da1ac256c7ee0fb1e07679791399f24648b933/test/mocha/timers.js#L29
test('should do nothing if the promise fulfills quickly', async t => {
  await timeout(200, undefined, delay(1))
  t.pass()
})

// https://github.com/petkaantonov/bluebird/blob/49da1ac256c7ee0fb1e07679791399f24648b933/test/mocha/timers.js#L34
test('should do nothing if the promise rejects quickly', async t => {
  const goodError = new Error('haha!')
  await t.throwsAsync(async () => {
    await timeout(200, undefined, delay(1).then(() => {
      throw goodError
    }))
  }, { is: goodError })
})

// https://github.com/petkaantonov/bluebird/blob/49da1ac256c7ee0fb1e07679791399f24648b933/test/mocha/timers.js#L46
test('should reject with a timeout error if the promise is too slow', async t => {
  await t.throwsAsync(async () => {
    await timeout(1, undefined, delay(100))
  }, { instanceOf: TimeoutError })
})

// https://github.com/petkaantonov/bluebird/blob/49da1ac256c7ee0fb1e07679791399f24648b933/test/mocha/timers.js#L53
test('should reject with a custom timeout error if the promise is too slow and msg was provided', async t => {
  await t.throwsAsync(async () => {
    await timeout(1, 'custom', delay(100))
  }, { instanceOf: TimeoutError, message: /custom/i })
})

// We did not support cancellation, so no cancel is expected
// https://github.com/petkaantonov/bluebird/blob/49da1ac256c7ee0fb1e07679791399f24648b933/test/mocha/timers.js#L61
test('should not cancel the parent promise once the timeout expires', async t => {
  let didNotExecute = true
  let wasRejectedWithTimeout = false
  const p = delay(220).then(() => {
    didNotExecute = false
  })
  timeout(110, undefined, p).then(() => 10).catch(error => {
    if (!(error instanceof TimeoutError)) { throw error }
    wasRejectedWithTimeout = true
  })
  await delay(330)
  t.false(didNotExecute, 'parent promise was not cancelled')
  t.assert(wasRejectedWithTimeout, 'promise was not rejected with timeout')
})

// https://github.com/petkaantonov/bluebird/blob/49da1ac256c7ee0fb1e07679791399f24648b933/test/mocha/timers.js#L76
test('should not cancel the parent promise if there are multiple consumers', async t => {
  let derivedNotCancelled = false
  const p = delay(220)
  const derived = p.then(function () {
    derivedNotCancelled = true
  })
  timeout(110, undefined, p).then(() => 10).catch(() => {})
  await delay(330)
  t.assert(derivedNotCancelled, 'derived promise was cancelled')
  t.not(derived, undefined)
})

// https://github.com/petkaantonov/bluebird/blob/49da1ac256c7ee0fb1e07679791399f24648b933/test/mocha/timers.js#L183
test('should reject with a custom error if an error was provided as a parameter', async t => {
  const err = new Error('Testing Errors')
  await t.throwsAsync(async () => {
    await timeout(1, err, delay(100))
  }, { is: err })
})

test('should reject with a timeout error', async t => {
  await t.throwsAsync(async () => {
    await timeout(1)
  }, { instanceOf: TimeoutError })
})

test('should reject with a custom timeout error', async t => {
  await t.throwsAsync(async () => {
    await timeout(1, 'custom')
  }, { instanceOf: TimeoutError, message: 'custom' })
})

test('should reject with a custom error', async t => {
  const err = new Error('Testing Errors')
  await t.throwsAsync(async () => {
    await timeout(1, err, delay(100))
  }, { is: err })
})
