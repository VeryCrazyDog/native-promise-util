# npu.map

```ts
async function mapSeries (
  input: Resolvable<Iterable<Resolvable<any>>>,
  mapper: (item: any, index: number, length: number) => Resolvable<any>,
  options?: {
    inflight?: number = 1
  }
): Promise<any[]>
```

Given an [`Iterable`][1] (an array, for example), or a promise of an `Iterable`, iterates
serially over all the values in it, executing the given `mapper` on each element.
If an element is a promise, the mapper will wait for it before proceeding. The `mapper`
function has signature `(item, index, length)` where `value` is the current element
(or its resolved value if it is a promise).

If, at any step:
* The mapper returns a promise or a thenable, it is awaited before continuing to the next iteration.
* The current element of the iteration is a *pending* promise, that promise will be
  awaited before running the mapper.
* The current element of the iteration is a *rejected* promise, the iteration will
  stop and be rejected as well (with the same reason).

If all iterations resolve successfully, the `.mapSeries()` call resolves to a new array
containing the results of each `mapper` execution, in order.

`.mapSeries()` is very similar to [`.each()`](./each.md). The difference between
`.each()` and `.mapSeries()` is their resolution value. `.mapSeries()` resolves with
an array as explained above, while `.each()` resolves with an array containing the
*resolved values of the input elements* (ignoring the outputs of the iteration steps).
This way, `.each()` is meant to be mainly used for side-effect operations (since the
outputs of the iterator are essentially discarded), just like the native `Array.forEach()`
method of arrays, while `.map()` is meant to be used as an async version of the native
`Array.map()` method of arrays.

The `input` iterable is not modified.


## Map series option: inflight

You may optionally specify a inflight limit:

```js
npu.mapSeries(..., { inflight: 3 });
```

The `inflight` limit applies to promises returned by the mapper function and it basically
limits the number of promises created. For example, if `inflight` is `3` and the mapper
callback has been called enough so that there are three returned promises currently pending,
no further callbacks are called until the first of the pending promises in the queue resolves.
So the mapper function will be called three times and it will be called again only after
the first promise resolves.


## Example

```js
const npu = require('native-promise-util')

;(async () => {
  const input = [500, 0, 100, 300, 101]
  const beginMapperOrder = []
  const endMapperOrder = []
  const output = await npu.mapSeries(input, async (item) => {
    beginMapperOrder.push(item)
    await npu.delay(item)
    endMapperOrder.push(item)
    return item
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
