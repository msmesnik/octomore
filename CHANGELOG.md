# Changelog

## 2017-02-27
* `[SEMVER_PATCH]` Iterating transformers will now correctly handle undefined source values (i.e. they will not do anything, as opposed to iterating over an array with one element - `undefined`)

## 2017-02-21
* `[SEMVER_PATCH]` Added `json` config property to `createFileCache`

## 2017-02-17
* `[SEMVER_MINOR]` `createDocument` now provides a `getUri` function by default
* `[SEMVER_MINOR]` Added `createAdditiveTransformer` function
