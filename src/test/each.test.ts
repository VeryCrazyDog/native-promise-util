// Import 3rd party modules
import test from 'ava'

// Import module to be tested
import { delay, each } from '../index'

// Test cases
// https://github.com/petkaantonov/bluebird/blob/49da1ac256c7ee0fb1e07679791399f24648b933/test/mocha/each.js#L41
test('takes value, index and length', async (t) => {
  const input = [delay(1, 1), delay(2, 2), delay(3, 3)]
  const intermediate: number[] = []
  await each<number>(Promise.resolve(input), (value, index, length) => {
    intermediate.push(value, index, length)
  })
  t.deepEqual(intermediate, [1, 0, 3, 2, 1, 3, 3, 2, 3])
})

// https://github.com/petkaantonov/bluebird/blob/49da1ac256c7ee0fb1e07679791399f24648b933/test/mocha/each.js#L51
test('waits for returned promise before proceeding next', async (t) => {
  const input = [delay(1, 1), delay(2, 2), delay(3, 3)]
  const intermediate: number[] = []
  await each<number>(Promise.resolve(input), async value => {
    intermediate.push(value)
    await delay(1)
    intermediate.push(value * 2)
  })
  t.deepEqual(intermediate, [1, 2, 2, 4, 3, 6])
})

// https://github.com/petkaantonov/bluebird/blob/49da1ac256c7ee0fb1e07679791399f24648b933/test/mocha/each.js#L75
test("doesn't iterate with an empty array", async (t) => {
  const output = await each([], () => {
    t.fail()
  })
  t.deepEqual(output, [])
})

// https://github.com/petkaantonov/bluebird/blob/49da1ac256c7ee0fb1e07679791399f24648b933/test/mocha/each.js#L83
test('iterates with an array of single item', async (t) => {
  const intermediate: number[] = []
  await each([delay(1, 1)], async value => {
    intermediate.push(value)
    await delay(1)
    intermediate.push(value * 2)
  })
  t.deepEqual(intermediate, [1, 2])
})

// https://github.com/petkaantonov/bluebird/blob/49da1ac256c7ee0fb1e07679791399f24648b933/test/mocha/each.js#L96
test("should return the array's values", async (t) => {
  const input = [delay(1, 1), delay(2, 2), delay(3, 3)]
  const intermediate: number[] = []
  const output = await each<number>(Promise.resolve(input), value => {
    intermediate.push(3 - value)
  })
  t.deepEqual(output, [1, 2, 3])
  t.deepEqual(intermediate, [2, 1, 0])
})

test('should start and end Iterator in input order', async (t) => {
  const input = [500, 0, 100, 300, 101]
  const beginIteratorItems: number[] = []
  const endIteratorItems: number[] = []
  const output: number[] = await each(input, async (item) => {
    beginIteratorItems.push(item)
    await delay(item)
    endIteratorItems.push(item)
  })
  t.deepEqual(output, input)
  t.deepEqual(beginIteratorItems, input)
  t.deepEqual(endIteratorItems, input)
})

test('should start Iterator in input order and end Iterator in execution time order with inflight', async (t) => {
  const input = [500, 0, 100, 300, 101]
  const beginIteratorOrder: number[] = []
  const endIteratorOrder: number[] = []
  const output: number[] = await each(input, async (item) => {
    beginIteratorOrder.push(item)
    await delay(item)
    endIteratorOrder.push(item)
  }, { inflight: 2 })
  t.deepEqual(output, input)
  t.deepEqual(beginIteratorOrder, input)
  t.deepEqual(endIteratorOrder, [0, 500, 100, 101, 300])
})
