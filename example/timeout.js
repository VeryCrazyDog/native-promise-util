const npu = require('../dist')

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
