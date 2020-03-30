# native-promise-util
A utility for working with native JavaScript Promise. Aims to provide compatible
[bluebird API](http://bluebirdjs.com/docs/api-reference.html) but on native Promise.

This utility is currently work-in-progress.

[![npm](https://img.shields.io/npm/v/native-promise-util)](https://www.npmjs.com/package/native-promise-util)
[![Build status](https://img.shields.io/github/workflow/status/VeryCrazyDog/native-promise-util/Node.js%20CI)](https://github.com/VeryCrazyDog/native-promise-util/actions?query=workflow%3A%22Node.js+CI%22)


## Install
```
npm install native-promise-util
```


## API
- [promiseUtil.delay](./doc/delay.md)
- [promiseUtil.map](./doc/map.md)


## License
This demo is licensed under the [MIT License](LICENSE).


## Acknowledge
- Most API design and a lot of test cases are ported from [bluebird](http://bluebirdjs.com/).
- `map` and `filter` API implementation are greatly inspired by [a Gist](https://gist.github.com/yongjun21/ec0ea757b9dcbf972a351453755cadcb)
	from [yongjun21](https://github.com/yongjun21).
