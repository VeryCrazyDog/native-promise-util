// Import 3rd party modules
import test from 'ava'

// Import module to be tested
import { delay, timeout } from '../index'

// Keep test case align with original
// eslint-disable-next-line @typescript-eslint/no-implied-eval, no-new-func
const globalObject = new Function('return this;')()

// Keep test case align with original
// eslint-disable-next-line @typescript-eslint/no-shadow
const globalsAreReflectedInGlobalObject = (function (window) {
  const fn = function (id: any): void { return clearTimeout(id) }
  const old = window.clearTimeout
  window.clearTimeout = fn
  const ret = clearTimeout === fn
  window.clearTimeout = old
  return ret
})(globalObject)

if (globalsAreReflectedInGlobalObject) {
  let fakeSetTimeout: any
  let fakeClearTimeout: any
  let expectedHandleType: any

  test.before(() => {
    fakeSetTimeout = globalObject.setTimeout
    fakeClearTimeout = globalObject.clearTimeout
    globalObject.setTimeout = globalObject.oldSetTimeout
    globalObject.clearTimeout = globalObject.oldClearTimeout
    expectedHandleType = typeof (globalObject.setTimeout(function () {}, 1))
  })

  test.after(() => {
    globalObject.setTimeout = fakeSetTimeout
    globalObject.clearTimeout = fakeClearTimeout
  })

  // https://github.com/petkaantonov/bluebird/blob/49da1ac256c7ee0fb1e07679791399f24648b933/test/mocha/timers.js#L115
  test('should clear timeouts with proper handle type when fulfilled', async t => {
    const old = globalObject.clearTimeout
    let handleType = 'empty'
    globalObject.clearTimeout = function (handle: any) {
      handleType = typeof handle
      globalObject.clearTimeout = old
    }
    await timeout(10000, undefined, delay(1))
    t.is(expectedHandleType, handleType)
  })

  // https://github.com/petkaantonov/bluebird/blob/49da1ac256c7ee0fb1e07679791399f24648b933/test/mocha/timers.js#L128
  test('should clear timeouts with proper handle type when rejected', async t => {
    const old = globalObject.clearTimeout
    let handleType = 'empty'
    globalObject.clearTimeout = function (handle: any) {
      handleType = typeof handle
      globalObject.clearTimeout = old
    }
    try {
      // eslint-disable-next-line promise/param-names
      await timeout(10000, undefined, new Promise(function (_resolve, reject) {
        setTimeout(reject, 10)
      }))
    } catch (error) {
      t.is(expectedHandleType, handleType)
    }
  })
}
