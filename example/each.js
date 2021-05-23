const npu = require('../dist')

;(async () => {
  const input = [500, 0, 100, 300, 101]
  const beginMapperOrder = []
  const endMapperOrder = []
  const output = await npu.each(input, async (item) => {
    beginMapperOrder.push(item)
    await npu.delay(item)
    endMapperOrder.push(item)
  }, { inflight: 2 })
  // Print [ 500, 0, 100, 300, 101 ]
  console.log(output)
  // Print [ 500, 0, 100, 300, 101 ]
  console.log(beginMapperOrder)
  // Print [ 0, 500, 100, 101, 300 ]
  console.log(endMapperOrder)
})()
