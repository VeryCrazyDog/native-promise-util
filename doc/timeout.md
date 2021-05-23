# npu.timeout

```ts
async function timeout(
  ms: number,
  message?: string = 'operation timed out',
  value?: Resolvable<any>
): Promise<any | undefined>
```
```ts
async function timeout(
  ms: number,
  error?: Error,
  value?: Resolvable<any>
): Promise<any | undefined>
```

Returns a promise that will be fulfilled with `value` promise's fulfillment value or
rejection reason. However, if `value` promise is not fulfilled or rejected within
`ms` milliseconds, or if `value` promise is not provided and `ms` milliseconds passed,
the returned promise is rejected with a `TimeoutError` or the `error` as the reason.

When using the first signature, you may specify a custom error message with the `message` parameter.

Since [bluebird cancellation][1] is not supported. `value` promise will still be settled.


## Example

```js
const npu = require('native-promise-util')

async function fakeReadFile () {
  return await npu.delay(500, 'This is file content')
}

;(async () => {
  try {
    const fileContents = await npu.timeout(100, undefined, fakeReadFile())
    console.log(fileContents)
  } catch (error) {
    if (error instanceof npu.TimeoutError) {
      console.log('Could not read file within 100ms')
    } else {
      throw error
    }
  }
})()
```



[1]: http://bluebirdjs.com/docs/api/cancellation.html
