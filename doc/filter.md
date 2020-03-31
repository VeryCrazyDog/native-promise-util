# promiseUtil.map

```ts
async function filter(
  input: Resolvable<Iterable<Resolvable<any>>>,
  filterer: (item: any, index: number, length: number) => Resolvable<any>,
  options?: {
    concurrency?: number = Infinity
  }
): Promise<any[]>
```

Given a finite [`Iterable`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Iteration_protocols)
(arrays are `Iterable`), or a promise of an `Iterable`, which produces promises
(or a mix of promises and values), iterate over all the values in the `Iterable`
into an array and [filter the array to another](http://en.wikipedia.org/wiki/Filter_\(higher-order_function\))
using the given `filterer` function.

The `input` iterable is not modified.


## Filter option: concurrency

See [Map option: concurrency](./map.md)


## Example

```js
const promiseUtil = require('native-promise-util')

;(async () => {
  const input = [4, 5, 1, 3, 2].map(i => Promise.resolve(i))
  const output = await promiseUtil.filter(input, i => i > 2)
  // Print [ 4, 5, 3 ]
  console.log(output)
})()
```
