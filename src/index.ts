async function delay<T> (ms: number, value?: T | PromiseLike<T>): Promise<T | undefined> {
  const result = await value
  await new Promise(resolve => setTimeout(resolve, ms))
  return result
}

export default {
  delay
}
