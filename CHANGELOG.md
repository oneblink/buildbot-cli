# Change Log

## Next

### Changed

- NBC-32: `bm buildbot evergreen` cmd with no `--force` flag functionality 

 - Will now prompt for confirmation to overwrite existing files instead of throwing an error

 - `--force` flag functionality has not changed, it now by passes the confirmation prompt

### Fixed

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
