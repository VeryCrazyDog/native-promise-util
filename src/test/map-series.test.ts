// Import 3rd party modules
import test from 'ava'

// Import module to be tested
import { delay, mapSeries } from '../index'

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
