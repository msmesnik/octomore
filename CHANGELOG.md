# Changelog

## 2017-10-32
* `[SEMVER_MAJOR]` Removed transpiling dependencies and scripts. octomore now requires nodejs `>= 7.6.0` for native `async` function support.  

## 2017-05-08
* `[SEMVER_MINOR]` Refactored logging - while default functionality remains unchanged you can now inject your own logger object into `createDocument` and `createFileCache` (see README for details)
* `[SEMVER_MINOR]` Removed debug output from `createTransformer` - it was overly verbose and hardly useful but would have been awkward to integrate with the aforementioned changes in logging

## 2017-04-20
* Refactored linting config: due to recent updates of the [standard](https://github.com/feross/standard) package we no longer need to include all sorts of `eslint-*` dev dependencies and configs to lint es6 code.
* `[SEMVER_PATCH]` Removed various redundant `return await` statements
* `[SEMVER_PATCH]` `request` function is now injected into HTTP retrievers for easier mocking (see README)

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
