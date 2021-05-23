const npu = require('../dist')

;(async () => {
  await npu.delay(500)
  console.log('500 ms passed')
  await npu.delay(500)
  console.log('another 500 ms passed')
})()
