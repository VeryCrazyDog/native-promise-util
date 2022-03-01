# Changelog
All notable changes to this module will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this module adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]
### Fixed
- Fix `TimeoutError.name` from `Error` to `TimeoutError`.
### Removed
- Remove support on Node.js v10, v11, v13.

## [0.5.0] - 2021-05-23
### Added
- Added `.timeout()` API.

### Changed
- A faster way to obtain the size of `Set` and `Map` instead of iterating through them.
- Removed unnecessary `return await` in `.delay()` API. For benefit, see [no-return-await].

## [0.4.2] - 2020-08-05
### Added
- Added `.d.ts` declaration files.

## [0.4.1] - 2020-04-04
### Fixed
- Fix incorrect link in README.

## [0.4.0] - 2020-04-04
### Added
- Added `.mapSeries()` and `.each()` API.

## [0.3.0] - 2020-03-31
### Added
- Added `.filter()` API.

## [0.2.0] - 2020-03-29
### Added
- Added `.map()` API.

## [0.1.1] - 2020-03-29
### Fixed
- Fix incorrect export path.

## [0.1.0] - 2020-03-29
### Added
- First release with `.delay()` API.



[Unreleased]: https://github.com/VeryCrazyDog/native-promise-util/compare/0.5.0...HEAD
[0.5.0]: https://github.com/VeryCrazyDog/native-promise-util/compare/0.4.2...0.5.0
[0.4.2]: https://github.com/VeryCrazyDog/native-promise-util/compare/0.4.1...0.4.2
[0.4.1]: https://github.com/VeryCrazyDog/native-promise-util/compare/0.4.0...0.4.1
[0.4.0]: https://github.com/VeryCrazyDog/native-promise-util/compare/0.3.0...0.4.0
[0.3.0]: https://github.com/VeryCrazyDog/native-promise-util/compare/0.2.0...0.3.0
[0.2.0]: https://github.com/VeryCrazyDog/native-promise-util/compare/0.1.1...0.2.0
[0.1.1]: https://github.com/VeryCrazyDog/native-promise-util/compare/0.1.0...0.1.1
[0.1.0]: https://github.com/VeryCrazyDog/native-promise-util/releases/tag/0.1.0

[no-return-await]: https://eslint.org/docs/rules/no-return-await
