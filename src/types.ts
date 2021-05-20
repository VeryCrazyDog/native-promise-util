// Public types
export type Resolvable<R> = R | PromiseLike<R>
export type IterateFunction<I, O> = (item: I, index: number, length: number) => Resolvable<O>

// Private types
export interface IteratorExecutionContext<I, O> {
  iterator: Iterator<Resolvable<I>>
  inputLength: number
  iteratedCount: number
  output: O[]
}
