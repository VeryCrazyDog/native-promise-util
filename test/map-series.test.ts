// Import 3rd party modules
import test from 'ava'

// Import module to be tested
import { delay, mapSeries } from '../src/index'

// Test cases
// https://github.com/petkaantonov/bluebird/blob/49da1ac256c7ee0fb1e07679791399f24648b933/test/mocha/each.js#L28
test("should return the array's promise values mapped", async (t) => {
  const input = Promise.resolve([delay(1, 1), delay(2, 2), delay(3, 3)])
  const intermediate: number[] = []
  const output: number[] = await mapSeries<number, number>(input, value => {
    intermediate.push(3 - value)
    return value + 2
  })
  t.deepEqual(output, [3, 4, 5])
  t.deepEqual(intermediate, [2, 1, 0])
})

// https://github.com/petkaantonov/bluebird/blob/49da1ac256c7ee0fb1e07679791399f24648b933/test/mocha/each.js#L162
test("should return the array's values mapped", async (t) => {
  const output = await mapSeries([1, 2, 3], value => value * 2)
  t.deepEqual(output, [2, 4, 6])
})

test('should start and end mapper in input order', async (t) => {
  const input = [500, 0, 100, 300, 101]
  const beginMapperItems: number[] = []
  const endMapperItems: number[] = []
  const output: number[] = await mapSeries(input, async (item) => {
    beginMapperItems.push(item)
    await delay(item)
    endMapperItems.push(item)
    return item
  })
  t.deepEqual(output, input)
  t.deepEqual(beginMapperItems, input)
  t.deepEqual(endMapperItems, input)
})

test('should start mapper in input order and end mapper in execution time order with inflight', async (t) => {
  const input = [500, 0, 100, 300, 101]
  const beginMapperOrder: number[] = []
  const endMapperOrder: number[] = []
  const output: number[] = await mapSeries(input, async (item) => {
    beginMapperOrder.push(item)
    await delay(item)
    endMapperOrder.push(item)
    return item
  }, { inflight: 2 })
  t.deepEqual(output, input)
  t.deepEqual(beginMapperOrder, input)
  t.deepEqual(endMapperOrder, [0, 500, 100, 101, 300])
})

test('should not have more than {inflight} promises in flight', async (t) => {
  type ResolveFunction = (value?: any) => void
  interface Delayed {
    promise: Promise<any>
    resolve: ResolveFunction
    index: number
    resolved: boolean
  }

  const BATCH_SIZE = 5
  const input: number[] = [30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40]
  const finishedList: number[] = []

  const immediates: Delayed[] = []
  // Keep test case align with original
  // eslint-disable-next-line @typescript-eslint/promise-function-async
  function immediate (index: number): Promise<any> {
    let resolveFunc: ResolveFunction = () => { }
    const promise = new Promise(resolve => {
      resolveFunc = resolve
    })
    immediates.push({
      promise,
      resolve: resolveFunc,
      index,
      resolved: false
    })
    // Keep test case align with original
    // eslint-disable-next-line @typescript-eslint/return-await
    return promise
  }

  const lates: Delayed[] = []
  // Keep test case align with original
  // eslint-disable-next-line @typescript-eslint/promise-function-async
  function late (index: number): Promise<any> {
    let resolveFunc: ResolveFunction = t.fail
    const promise = new Promise(resolve => {
      resolveFunc = resolve
    })
    lates.push({
      promise,
      resolve: resolveFunc,
      index,
      resolved: false
    })
    // Keep test case align with original
    // eslint-disable-next-line @typescript-eslint/return-await
    return promise
  }

  function resolveDelayed (delayed: Delayed): void {
    if (!delayed.resolved) {
      delayed.resolve(delayed.index)
      delayed.resolved = true
    }
  }

  const mapSeriesPromise = mapSeries(input, async (value, index) => {
    await (index < BATCH_SIZE ? immediate(index) : late(index))
    finishedList.push(value)
  }, { inflight: BATCH_SIZE })

  const crossCheckPromise = (async () => {
    // Wait for map() to execute mapper and update output array
    await delay(100)
    t.is(finishedList.length, 0)
    immediates.forEach(resolveDelayed)
    // Wait for map() to execute mapper and update output array
    await delay(100)
    t.deepEqual(finishedList, [30, 31, 32, 33, 34])
    lates.forEach(resolveDelayed)
    // Wait for map() to execute mapper and update output array
    await delay(100)
    t.deepEqual(finishedList, [30, 31, 32, 33, 34, 35, 36, 37, 38, 39])
    lates.forEach(resolveDelayed)
    await mapSeriesPromise
    t.deepEqual(input, finishedList)
  })()
  await Promise.all([mapSeriesPromise, crossCheckPromise])
})
