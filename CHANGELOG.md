# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [6.1.0] - 2023-06-05

### Changed
 - umd.js to umd.cjs

## [6.0.0] - 2023-06-04

### Added
 - `changelog.mjs` to generate a new entry to changelog accessible via `npm run gen-changelog`
 - DeviceEvents json file generator script `eventGenerator.mjs`
### Changed
 - rewrote DeviceEvent constants to be generated from hardware-descriptors
 - Split events to SerialEvents and DeviceEvents
 - `npm run docgen` is now `npm run gen-typedoc`
