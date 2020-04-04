# native-promise-util
A utility for working with native JavaScript Promise. Aims to provide compatible
[bluebird API] but on native Promise.

This utility is currently work-in-progress.

[![Version on npm]][native-promise-util]
[![Build status]][Build workflow]


## Install
```
npm install native-promise-util
```


## API
The follow API are currently provided:
- [promiseUtil.delay](./doc/delay.md)
- [promiseUtil.map](./doc/map.md)
- [promiseUtil.mapSeries](./doc/map-series.md)
- [promiseUtil.filter](./doc/filter.md)


## License
This module is licensed under the [MIT License](./LICENSE).


## Acknowledge
This module was built by referencing the following material:
- Most API design and a lot of test cases are ported from [bluebird]().
- `map` and `filter` API implementation are inspired by [a Gist][1] from [yongjun21].


## Alternatives
Some alternatives and similar implementations which can be considered:
- [promise-fun], which is a collection of separated modules including [p-map], [p-filter] and more
- [@vendredix/promise]



[1]: https://gist.github.com/yongjun21/ec0ea757b9dcbf972a351453755cadcb
[@vendredix/promise]: https://www.npmjs.com/package/@vendredix/promise
[bluebird API]: http://bluebirdjs.com/docs/api-reference.html
[bluebird]: http://bluebirdjs.com/
[Build status]: https://img.shields.io/github/workflow/status/VeryCrazyDog/native-promise-util/Node.js%20CI
[Build workflow]: https://github.com/VeryCrazyDog/native-promise-util/actions?query=workflow%3A%22Node.js+CI%22
[native-promise-util]: https://www.npmjs.com/package/native-promise-util
[p-filter]: https://www.npmjs.com/package/p-filter
[p-map]: https://www.npmjs.com/package/p-map
[promise-fun]: https://github.com/sindresorhus/promise-fun#packages
[Version on npm]: https://img.shields.io/npm/v/native-promise-util
[yongjun21]: https://github.com/yongjun21
