# native-promise-util (npu)
A utility for working with native JavaScript Promise. Aims to provide compatible
[bluebird API] but on native Promise.

[![Version on npm]][native-promise-util]
[![Build status]][Build workflow]


## Install
```
npm install native-promise-util
```


## API
The follow API are currently provided:
- [npu.delay](./doc/delay.md)
- [npu.each](./doc/each.md), with additional `inflight` options
- [npu.filter](./doc/filter.md)
- [npu.map](./doc/map.md)
- [npu.mapSeries](./doc/map-series.md), with additional `inflight` options
- [npu.timeout](./doc/timeout.md)


## License
This module is licensed under the [MIT License](./LICENSE).


## Acknowledge
This module was built by referencing the following materials:
- Most API design and a lot of test cases are ported from [bluebird].
- `map` and `filter` API implementation are inspired by [a Gist][1] from [yongjun21].


## Alternatives
Some alternatives and similar implementations which can be considered:
- [modern-async]
- [@vendredix/promise]
- [promise-fun], which is a collection of separated modules including [p-map], [p-filter] and more



[1]: https://gist.github.com/yongjun21/ec0ea757b9dcbf972a351453755cadcb/e75a7c54b75aa09fd1f8c3d8e73906e35105c9cc
[@vendredix/promise]: https://www.npmjs.com/package/@vendredix/promise
[bluebird API]: http://bluebirdjs.com/docs/api-reference.html
[bluebird]: http://bluebirdjs.com/
[Build status]: https://github.com/VeryCrazyDog/native-promise-util/workflows/Node.js%20CI/badge.svg
[Build workflow]: https://github.com/VeryCrazyDog/native-promise-util/actions?query=workflow%3A%22Node.js+CI%22
[modern-async]: https://www.npmjs.com/package/modern-async
[native-promise-util]: https://www.npmjs.com/package/native-promise-util
[p-filter]: https://www.npmjs.com/package/p-filter
[p-map]: https://www.npmjs.com/package/p-map
[promise-fun]: https://github.com/sindresorhus/promise-fun#packages
[Version on npm]: https://badgen.net/npm/v/native-promise-util
[yongjun21]: https://github.com/yongjun21
