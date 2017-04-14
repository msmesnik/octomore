# Changelog


* `[SEMVER_MINOR]` `debug` function is now injected into `createDocument`, `createTransformer` and `createFileCache` (no changes to default behavior)
 
## 2017-03-29
* `[SEMVER_PATCH]` Transformers will no longer output warnings via `console.warn` - they will now use the `debug` module instead

## 2017-03-16
* `[SEMVER_MAJOR]` Removed `uriTemplate` param - document URIs will now always be determined by the provided `getUri` function
* `[SEMVER_PATCH]` Fixed a bug that caused properties with a boolean `false` spec to still be included in transformed output 

## 2017-03-12
* `[SEMVER_MINOR]` Second level transform specs can now be objects (will be wrapped by `createTransformer`)

## 2017-02-27
* `[SEMVER_PATCH]` Iterating transformers will now correctly handle undefined source values (i.e. they will not do anything, as opposed to iterating over an array with one element - `undefined`)

## 2017-02-21
* `[SEMVER_PATCH]` Added `json` config property to `createFileCache`

## 2017-02-17
* `[SEMVER_MINOR]` `createDocument` now provides a `getUri` function by default
* `[SEMVER_MINOR]` Added `createAdditiveTransformer` function
