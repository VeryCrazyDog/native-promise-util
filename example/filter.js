const npu = require('../dist')

;(async () => {
  const input = [4, 5, 1, 3, 2].map(i => Promise.resolve(i))
  const output = await npu.filter(input, i => i > 2)
  // Print [ 4, 5, 3 ]
  console.log(output)
})()
