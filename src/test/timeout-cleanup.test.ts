// Import 3rd party modules
import type { TestInterface } from 'ava'
import anyTest from 'ava'

// Import module to be tested
import { delay, timeout } from '../index'

interface TestContext {
  globalObject: any
  fakeSetTimeout: any
  fakeClearTimeout: any
  expectedHandleType: any
}

const test = anyTest as TestInterface<TestContext>

test.before(t => {
  // Keep test case align with original
  // eslint-disable-next-line @typescript-eslint/no-implied-eval, no-new-func
  const globalObject = new Function('return this;')()
  t.context.globalObject = globalObject

  globalObject.oldSetTimeout = global.setTimeout
  globalObject.oldClearTimeout = global.clearTimeout

  // Keep test case align with original
  // eslint-disable-next-line @typescript-eslint/no-shadow
  const globalsAreReflectedInGlobalObject = (function (window: any): boolean {
    const fn = function (id: any): void { return clearTimeout(id) }
    const old = window.clearTimeout
    window.clearTimeout = fn
    const ret = clearTimeout === fn
    window.clearTimeout = old
    return ret
  })(globalObject)
  t.true(globalsAreReflectedInGlobalObject)

  t.context.fakeSetTimeout = globalObject.setTimeout
  t.context.fakeClearTimeout = globalObject.clearTimeout
  globalObject.setTimeout = globalObject.oldSetTimeout
  globalObject.clearTimeout = globalObject.oldClearTimeout
  t.context.expectedHandleType = typeof (globalObject.setTimeout(function () {}, 1))
})

test.after(t => {
  t.context.globalObject.setTimeout = t.context.fakeSetTimeout
  t.context.globalObject.clearTimeout = t.context.fakeClearTimeout
})

// https://github.com/petkaantonov/bluebird/blob/49da1ac256c7ee0fb1e07679791399f24648b933/test/mocha/timers.js#L115
test.serial('should clear timeouts with proper handle type when fulfilled', async t => {
  const old = t.context.globalObject.clearTimeout
  let handleType = 'empty'
  t.context.globalObject.clearTimeout = function (handle: any) {
    handleType = typeof handle
    t.context.globalObject.clearTimeout = old
  }
  await timeout(10000, undefined, delay(1))
  t.is(t.context.expectedHandleType, handleType)
})

// https://github.com/petkaantonov/bluebird/blob/49da1ac256c7ee0fb1e07679791399f24648b933/test/mocha/timers.js#L128
test.serial('should clear timeouts with proper handle type when rejected', async t => {
  const old = t.context.globalObject.clearTimeout
  let handleType = 'empty'
  t.context.globalObject.clearTimeout = function (handle: any) {
    handleType = typeof handle
    t.context.globalObject.clearTimeout = old
  }
  try {
    // eslint-disable-next-line promise/param-names
    await timeout(10000, undefined, new Promise(function (_resolve, reject) {
      setTimeout(reject, 10)
    }))
  } catch (error) {
    t.is(t.context.expectedHandleType, handleType)
  }
})
