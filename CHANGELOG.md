# Change Log

## Unreleased

### Changed

-   AWS credentials retrieval to use buildbot service instead of `@blinkmobile/bm-identity`

## 1.3.4 - 2018-05-09

-   update [aws-sdk](https://www.npmjs.com/package/aws-sdk) to [2.235.1](https://github.com/aws/aws-sdk-js/releases/tag/v2.235.1) (from [2.188.0](https://github.com/aws/aws-sdk-js/releases/tag/v2.188.0))

-   update [chalk](https://www.npmjs.com/package/chalk) to [2.4.1](https://github.com/chalk/chalk/releases/tag/v2.4.1) (from [2.3.0](https://github.com/chalk/chalk/releases/tag/v2.3.0))

-   update [execa](https://www.npmjs.com/package/execa) to 0.10.0 (from 0.9.0)

-   update [inquirer](https://www.npmjs.com/package/inquirer) to [5.2.0](https://github.com/SBoudrias/Inquirer.js/releases/tag/v5.2.0) (from [5.0.1](https://github.com/SBoudrias/Inquirer.js/releases/tag/v5.0.1))

-   update [meow](https://www.npmjs.com/package/meow) to 5.0.0 (from 4.0.0)

-   update [update-notifier](https://www.npmjs.com/package/update-notifier) to 2.5.0 (from 2.3.0)

-   no longer depend upon [valid-email](https://www.npmjs.com/package/valid-email)

-   depend upon [email-validator](https://www.npmjs.com/package/email-validator) [2.0.3](https://github.com/manishsaraan/email-validator/blob/master/CHANGELOG.md)

## 1.3.3 - 2018-02-02

### Dependencies

-   update [@blinkmobile/bm-identity](https://www.npmjs.com/package/@blinkmobile/bm-identity) to [4.0.0](https://github.com/blinkmobile/bm-identity.js/releases/tag/4.0.0) (from [2.3.4](https://github.com/blinkmobile/bm-identity.js/releases/tag/2.3.4))

-   update [archiver](https://www.npmjs.com/package/archiver) to [2.1.1](https://github.com/archiverjs/node-archiver/releases/tag/2.1.1) (from [1.3.0](https://github.com/archiverjs/node-archiver/releases/tag/1.3.0))

-   update [aws-sdk](https://www.npmjs.com/package/aws-sdk) to [2.188.0](https://github.com/aws/aws-sdk-js/releases/tag/v2.188.0) (from [2.62.0](https://github.com/aws/aws-sdk-js/releases/tag/v2.62.0))

-   update [chalk](https://www.npmjs.com/package/chalk) to [2.3.0](https://github.com/chalk/chalk/releases/tag/v2.3.0) (from 1.1.3)

-   update [execa](https://www.npmjs.com/package/execa) to 0.9.0 (from 0.6.3)

-   update [inquirer](https://www.npmjs.com/package/inquirer) to [5.0.1](https://github.com/SBoudrias/Inquirer.js/releases/tag/v5.0.1) (from [3.0.6](https://github.com/SBoudrias/Inquirer.js/releases/tag/v3.0.6))

-   update [log-update](https://www.npmjs.com/package/log-update) to 2.3.0 (from 2.0.0)

-   update [meow](https://www.npmjs.com/package/meow) to [4.0.0](https://github.com/sindresorhus/meow/releases/tag/v4.0.0) (from 3.7.0)

-   update [update-notifier](https://www.npmjs.com/package/update-notifier) to 2.3.0 (from 2.1.0)

-   update [xml2js](https://www.npmjs.com/package/xml2js) to 0.4.19 (from 0.4.17)

## 1.3.2 - 2017-06-05

### Added

- NBC-44 # `bmProject`, `command`, and `platforms` parameters to requests to assume AWS roles

### Dependencies

-   update [@blinkmobile/bm-identity](https://www.npmjs.com/package/@blinkmobile/bm-identity) to [2.3.4](https://github.com/blinkmobile/bm-identity.js/releases/tag/2.3.4) (from [2.1.0](https://github.com/blinkmobile/bm-identity.js/releases/tag/2.1.0))

-   update [archiver](https://www.npmjs.com/package/archiver) to [1.3.0](https://github.com/archiverjs/node-archiver/releases/tag/1.3.0) (from [1.1.0](https://github.com/archiverjs/node-archiver/releases/tag/1.1.0))

-   update [aws-sdk](https://www.npmjs.com/package/aws-sdk) to [2.62.0](https://github.com/aws/aws-sdk-js/releases/tag/v2.62.0) (from [2.6.9](https://github.com/aws/aws-sdk-js/releases/tag/v2.6.9))

-   update [execa](https://www.npmjs.com/package/execa) to 0.6.3 (from 0.5.0)

-   update [inquirer](https://www.npmjs.com/package/inquirer) to [3.0.6](https://github.com/SBoudrias/Inquirer.js/releases/tag/v3.0.6) (from 1.2.2)

-   update [log-update](https://www.npmjs.com/package/log-update) to 2.0.0 (from 1.0.2)

-   update [update-notifier](https://www.npmjs.com/package/update-notifier) to 2.1.0 (from [1.0.2](https://github.com/yeoman/update-notifier/releases/tag/v1.0.2))

-   update [xml2js](https://www.npmjs.com/package/xml2js) to 0.4.17 (from 0.4.16)

## 1.3.1 - 2016-10-18

### Fixed

- NBC-37: Errors exiting with incorrect code

### Changed

- NBC-37: Messages when running `bm buildbot evergreen` cmd

## 1.3.0 - 2016-10-07

### Changed

- NBC-32: `bm buildbot evergreen` cmd with no `--force` flag functionality

 - Will now prompt for confirmation to overwrite existing files instead of throwing an error

 - `--force` flag functionality has not changed, it now by passes the confirmation prompt

### Fixed

- NBC-33: Fixed `bm buildbot --help` examples still referencing the `--buildMode` flag

- NBC-34: Fixed evergreen uploads access control

## 1.2.0 - 2016-09-30

### Added

- NBC-31: Upload functionality to `bm buildbot evergreen` cmd

 - Added `--upload` and `--no-upload` flags

### Deprecated

- NBC-31: `--buildMode` flag from `bm buildbot buildbot` cmd

 - Replaced with `--release` and `--debug` flags

## 1.1.1 - 2016-09-14

### Fixed

- NBC-30: Typos in `CONTRIBUTING.md` and `README.md`

## 1.1.0 - 2016-09-14

### Changed

- NBC-29: bumped `@blinkmobile/bm-identity` to 2.1.0
