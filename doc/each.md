# promiseUtil.each

```ts
async function each (
  input: Resolvable<Iterable<Resolvable<any>>>,
  iterator: (item: any, index: number, length: number) => Resolvable<any>,
  options?: {
    inflight?: number = 1
  }
): Promise<any[]>;
```

Given an [`Iterable`][1] (an array, for example), or a promise of an `Iterable`, iterates
serially over all the values in it, executing the given `iterator` on each element.
If an element is a promise, the iterator will wait for it before proceeding. The `iterator`
function has signature `(item, index, length)` where `value` is the current
element (or its resolved value if it is a promise).

If, at any step:
* The iterator returns a promise or a thenable, it is awaited before continuing to the next iteration.
* The current element of the iteration is a *pending* promise, that promise will be
  awaited before running the iterator.
* The current element of the iteration is a *rejected* promise, the iteration will
  stop and be rejected as well (with the same reason).

If all iterations resolve successfully, the `.each()` call resolves to a new array
containing the resolved values of the original input elements.

`.each()` is very similar to [.mapSeries()](./map-series.md). The difference between
`.each()` and `.mapSeries()` is their resolution value. `.each()` resolves with an
array as explained above, while `.mapSeries()` resolves with an array containing the
*outputs* of the iterator function on each step. This way, `.each()` is meant to be
mainly used for side-effect operations (since the outputs of the iterator are essentially
discarded), just like the native `Array.forEach()` method of arrays, while `.map()` is
meant to be used as an async version of the native `Array.map()` method of arrays.


## Each option: inflight

See [Map series option: inflight](./map-series.md)


## Example

```js
const promiseUtil = require('native-promise-util')

;(async () => {
  const input = [500, 0, 100, 300, 101]
  const beginMapperOrder = []
  const endMapperOrder = []
  const output = await promiseUtil.each(input, async (item) => {
    beginMapperOrder.push(item)
    await promiseUtil.delay(item)
    endMapperOrder.push(item)
  }, { inflight: 2 })
  // Print [ 500, 0, 100, 300, 101 ]
  console.log(output)
  // Print [ 500, 0, 100, 300, 101 ]
  console.log(beginMapperOrder)
  // Print [ 0, 500, 100, 101, 300 ]
  console.log(endMapperOrder)
})()
```



[1]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Iteration_protocols
