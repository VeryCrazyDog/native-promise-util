// eslint-disable-next-line @typescript-eslint/promise-function-async
function delay (ms: number): Promise<undefined> {
  // eslint-disable-next-line @typescript-eslint/return-await
  return new Promise(resolve => setTimeout(resolve, ms))
}

export default {
  delay
}
