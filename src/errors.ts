export class TimeoutError extends Error {
  constructor (message?: string) {
    super(message ?? 'timeout error')
    this.name = 'TimeoutError'
  }
}
