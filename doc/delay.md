# promiseUtil.delay

```ts
async function delay(
  ms: number,
  value?: Resolvable<any>
): Promise<any | undefined>
```

Returns a promise that will be resolved with `value` (or `undefined`) after given `ms` milliseconds.
If `value` is a promise, the delay will start counting down when it is fulfilled and the returned
promise will be fulfilled with the fulfillment value of the `value` promise. If `value` is a
rejected promise, the resulting promise will be rejected immediately. 


## Example

```js
const promiseUtil = require('native-promise-util')

;(async () => {
  await promiseUtil.delay(500)
  console.log('500 ms passed')
  await promiseUtil.delay(500)
  console.log('another 500 ms passed')
})()
```
