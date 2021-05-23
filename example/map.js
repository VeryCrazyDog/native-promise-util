const npu = require('../dist')

;(async () => {
  const input = [500, 0, 200, 200, 200]
  const finishedList = []
  await npu.map(input, async item => {
    await npu.delay(item)
    finishedList.push(item)
    return item
  }, { concurrency: 2 })
  // Print [ 0, 200, 200, 500, 200 ]
  console.log(finishedList)
})()
