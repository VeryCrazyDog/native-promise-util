// Import 3rd party modules
import test from 'ava'

// Import module to be tested
import { delay, timeout, TimeoutError } from '../index'

// Test cases
// https://github.com/petkaantonov/bluebird/blob/49da1ac256c7ee0fb1e07679791399f24648b933/test/mocha/timers.js#L29
test.skip('should do nothing if the promise fulfills quickly', async t => {
  await timeout(200, undefined, delay(1))
  t.pass()
})

// https://github.com/petkaantonov/bluebird/blob/49da1ac256c7ee0fb1e07679791399f24648b933/test/mocha/timers.js#L34
test.skip('should do nothing if the promise rejects quickly', async t => {
  const goodError = new Error('haha!')
  try {
    await timeout(200, undefined, delay(1).then(() => {
      throw goodError
    }))
  } catch (error) {
    t.is(error, goodError)
  }
})

// https://github.com/petkaantonov/bluebird/blob/49da1ac256c7ee0fb1e07679791399f24648b933/test/mocha/timers.js#L46
test.skip('should reject with a timeout error if the promise is too slow', async t => {
  try {
    await timeout(10, undefined, delay(1))
  } catch (error) {
    if (!(error instanceof TimeoutError)) { throw error }
  }
  t.pass()
})

// https://github.com/petkaantonov/bluebird/blob/49da1ac256c7ee0fb1e07679791399f24648b933/test/mocha/timers.js#L53
test.skip('should reject with a custom timeout error if the promise is too slow and msg was provided', async t => {
  try {
    await timeout(10, 'custom', delay(1))
  } catch (error) {
    if (!(error instanceof TimeoutError)) { throw error }
    t.regex(error.message, /custom/i)
  }
})

// https://github.com/petkaantonov/bluebird/blob/49da1ac256c7ee0fb1e07679791399f24648b933/test/mocha/timers.js#L61
test.skip('should cancel the parent promise once the timeout expires', async t => {
  let didNotExecute = true
  let wasRejectedWithTimeout = false
  const p = delay(22).then(() => {
    didNotExecute = false
  })
  timeout(11, undefined, p).then(() => 10).catch(error => {
    if (!(error instanceof TimeoutError)) { throw error }
    wasRejectedWithTimeout = true
  })
  await delay(33)
  t.assert(didNotExecute, 'parent promise was not cancelled')
  t.assert(wasRejectedWithTimeout, 'promise was not rejected with timeout')
})

// https://github.com/petkaantonov/bluebird/blob/49da1ac256c7ee0fb1e07679791399f24648b933/test/mocha/timers.js#L76
test.skip('should not cancel the parent promise if there are multiple consumers', async t => {
  let derivedNotCancelled = false
  const p = delay(22)
  const derived = p.then(function () {
    derivedNotCancelled = true
  })
  timeout(11, undefined, p).then(() => 10).catch(() => {})
  await delay(33)
  t.assert(derivedNotCancelled, 'derived promise was cancelled')
  t.not(derived, undefined)
})
