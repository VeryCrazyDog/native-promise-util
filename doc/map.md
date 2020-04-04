# promiseUtil.map

```ts
async function map(
  input: Resolvable<Iterable<Resolvable<any>>>,
  mapper: (item: any, index: number, length: number) => Resolvable<any>,
  options?: {
    concurrency?: number = Infinity
  }
): Promise<any[]>
```

Given a finite [`Iterable`][1] (arrays are `Iterable`), or a promise of an `Iterable`, which produces promises
(or a mix of promises and values), iterate over all the values in the `Iterable`
into an array and [map the array to another] using the given `mapper` function.

Promises returned by the `mapper` function are awaited for and the returned promise
doesn't fulfill until all mapped promises have fulfilled as well. If any promise in
the array is rejected, or any promise returned by the `mapper` function is rejected,
the returned promise is rejected as well.

The mapper function for a given item is called as soon as possible, that is, when
the promise for that item's index in the input array is fulfilled. It means that `.map()`
can be used for concurrency coordination unlike `Promise.all`.

The `input` iterable is not modified, the array resolved from returned promise preserves
the original `input` order.


## Map option: concurrency

You may optionally specify a concurrency limit:

```js
promiseUtil.map(..., { concurrency: 3 });
```

The `concurrency` limit applies to Promises returned by the mapper function and it basically
limits the number of Promises created. For example, if `concurrency` is `3` and the mapper
callback has been called enough so that there are three returned Promises currently pending,
no further callbacks are called until one of the pending Promises resolves. So the mapper
function will be called three times and it will be called again only after at least one
of the Promises resolves.


## Example

```js
const promiseUtil = require('native-promise-util')

;(async () => {
  const input = [500, 0, 200, 200, 200]
  const finishedList = []
  await promiseUtil.map(input, async item => {
    await promiseUtil.delay(item)
    finishedList.push(item)
    return item
  }, { concurrency: 2 })
  // Print [ 0, 200, 200, 500, 200 ]
  console.log(finishedList)
})()
```



[1]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Iteration_protocols
[2]: https://en.wikipedia.org/wiki/Map_%28higher-order_function%29
