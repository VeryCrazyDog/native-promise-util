# promiseUtil.map

```ts
promiseUtil.map(
	input: Resolvable<Iterable<Resolvable<any>>>,
	mapper: (item: any, index: number, length: number) => Resolvable<any>,
	options?: ConcurrencyOption
): Promise<any[]>
```

Given a finite [`Iterable`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Iteration_protocols)
(arrays are `Iterable`), or a promise of an `Iterable`, which produces promises
(or a mix of promises and values), iterate over all the values in the `Iterable`
into an array and [map the array to another](http://en.wikipedia.org/wiki/Map_\(higher-order_function\))
using the given `mapper` function.

Promises returned by the `mapper` function are awaited for and the returned promise
doesn't fulfill until all mapped promises have fulfilled as well. If any promise in
the array is rejected, or any promise returned by the `mapper` function is rejected,
the returned promise is rejected as well.

The mapper function for a given item is called as soon as possible, that is, when
the promise for that item's index in the input array is fulfilled. It means that `.map`
can be used for concurrency coordination unlike `Promise.all`.


## Map Option: concurrency

You may optionally specify a concurrency limit:

```js
promiseUtil.map(..., {concurrency: 3});
```

The concurrency limit applies to Promises returned by the mapper function and it basically
limits the number of Promises created. For example, if `concurrency` is `3` and the mapper
callback has been called enough so that there are three returned Promises currently pending,
no further callbacks are called until one of the pending Promises resolves. So the mapper
function will be called three times and it will be called again only after at least one
of the Promises resolves.