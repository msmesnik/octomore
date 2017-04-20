# octomore
[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg)](http://standardjs.com/)

octomore is an efficient, functional data retrieval and transformation library for node.js. It is named after the heavily peated [scotch whisky](https://www.bruichladdich.com/octomore) (which has absolutely nothing to do with this library). 

## Installation
```
npm install --save octomore
```

## Use Case
When writing APIs a common scenario is fetching data from one source, modifying bits of that data, perhaps removing some unused parts of it, and then returning that data to the client. Depending on the structure of the source data, as well as the complexity of the required modifications, this can be a trivial or a tedious task. Things get more complex still when the fetched source data contains values that need to be used to fetch another set of data from somewhere else (e.g. fetched user data containing a list of post ids, and fetching the post title for each one of them).

The goal of octomore is to streamline this process by providing a simple API based on pure (async) functions for data retrieval, transformation and caching. 

## Concepts
### Documents
A document is a collection of functions that together fetch raw data from somewhere, apply a transformation and then return that data. Both raw source data as well as transformed output can be cached by supplying a cache object to the `createDocument` function.  

#### `createDocument` API
`createDocument ({ retriever, getUri, transformer, rawCache, transformedCache, getCacheId, friendlyName }) -> function`
* `retriever`: function for retrieving raw data
* `getUri`: function that returns the full URI for a provided `id` (defaults to a function that returns only the id)
* `transformer`: function that recieves raw source data and returns transformed data - see "Transformers" section below (defaults to no transformation)
* `rawCache`: cache object used for caching raw source data - see "Caching" section below (defaults to no cache)
* `transformedCache`: cache object used for caching transformed data - see "Caching" section below (defaults to no cache)
* `getCacheId`: function that recieves the full document URI and returns a cache id for that URI (defaults to MD5 hash of document URI)
* `friendlyName`: string used to identify document type in debug output (defaults to `Document`)


```js
const { createDocument, createHttpRetriever, createTransformer } = require('octomore')

const transformSpec = require('./transform-spec.js') // See "Transformers" section for an actual example

const getUser = createDocument({
  getUri: (id) => `https://my.api/v1/user/${id}`,
  retriever: createHttpRetriever(),
  transformer: createTransformer(transformSpec),
  friendlyName: 'User'
})

getUser(123).then((data) => console.dir(data))
```

### Retrievers
A retriever is a simple async function that will be called to retrieve raw data. It receives two parameters - the document URI (as returned by the `getUri` function) and any additional options passed to the request. octomore comes bundled with two retrievers: a file retriever for reading data from local files and an HTTP retriever for retrieving data from the internet (see "Bundled Retrievers" section below).  
 
### Transformers
A transformer is an async function that receives raw source data and returns transformed output. Of course, this is the exact concept of a reducer (and [bluebirds](http://bluebirdjs.com/) `Promise.reduce` is precisely what powers much of the underlying mechanisms of octomore).  

#### `createTransformer` API
`createTransformer (function|object[, ...]) -> function`

`createTransformer` accepts an arbitrary number of parameters, each of which must be either a function or an object (these parameters will be referred to as `specifications` or `specs`). The async function returned by `createTransformer` expects raw source data and will apply each spec in sequence, passing it the data returned by the previous spec (again, exactly like `.reduce`).  

##### Function Specs
A spec function will receive one parameter - the source data -, be `await`ed and is expected to return transformed data. While this may not seem very useful on its own, it can be a powerful feature when combined in a chain of specs. 
 
When dealing with XML source data, for instance, this can be used as the first spec in the transformer chain to turn the XML string into an object (using [xml2js](https://github.com/Leonidas-from-XIV/node-xml2js) or something similar), which can be processed by an object spec in the next step. 

##### Object Specs
The real power of octomore lies in the declarative approach of object specs. These allow specifying the structure of the transformed output and applying transformation functions on several levels.
At its core, an object spec defines properties present in transformed output, mapping their values to values in source data. Like many things in programming, this is probably best illustrated by a simple, if somewhat contrived, example.

```js
const { createTransformer } = require('octomore')

const source = {
  id: 123,
  brand_name: 'Port Charlotte',
  casks: {
    types: 'American Oak, European Oak, New Oak'
  },
  age: '16',
  keywords: [ 'whisky', 'islay', 'scotch', 'single malt' ]
}

const applyTransform = createTransformer({
  id: true,
  brandName: 'brand_name',
  fullName: ({ brand_name, aged_years }) => `${brand_name} (${aged_years} years)`,
  caskTypes: { src: 'casks.types', transform: (str) => str.split(', ') },
  age: { transform: (str) => parseInt(str, 10) },
  keywords: { transform: (str) => str.toUpperCase(), iterate: true, max: 3 }
})

applyTransform(source)
  .then((output) => console.dir(output))

/* ->
{ 
  id: 123,
  brandName: 'Port Charlotte',
  fullName: 'Port Charlotte (16 years)',
  caskTypes: [ 'American Oak', 'European Oak', 'New Oak' ],
  age: 16,
  keywords: [ 'WHISKY', 'ISLAY', 'SCOTCH' ]
}
*/
```

As the above example demonstrates, value mappings can be specified in various ways:

* `boolean`: include value from source data as-is (e.g. `id`)
* `string`: specifies name of source data property to map to (e.g. `brandName`)
* `function`: function that recieves full source data and returns transformed data (e.g. `fullName`)
* `object`:
  * `src`: name of source property (defaults to name of target property, e.g. `age`)
  * `transform`: function that recieves _only the value of the source property_ and returns transformed data (defaults to returning unmodified data)
  * `iterate`: iterate over source data, applying transform function to each individual element (defaults to `false`)
  * `max`: maximum amount of items to include when iterating over source data (defaults to no limit)

All source property names support [object-path](https://github.com/mariocasciaro/object-path) notation and all transformation functions can (but do not have to) be async or Promise returning functions. Since `createTransformer` returns a function, it can be used wherever transformation functions are supported. This means you can nest transformers for more complex scenarios while keeping the individual pieces small and testable.

Transformed output will only contain properties explicitly specified. To include all properties from source data by default the provided helper function `createAdditiveTransformer` can be used. 

### Caching
octomore provides hooks for caching both raw source data as well as transformed output. These caches operate independently from one another.

#### Cache Object Interface
Cache objects must implement the following functions:

* `getConfig () -> object`: returns cache configuration
* `exists (id) -> boolean`: returns `true` if the provided id exists in the cache (regardless of whether or not it is outdated) 
* `isOutdated (id) -> boolean`: returns `true` if the cached resource is older than `maxLifetime` seconds
* `store (id, data) -> void`: stores provided data in the cache and associates it with the provided `id`
* `retrieve (id) -> data`: retrieves cached data for the provided `id`
* `remove (id) -> void`: removes cached data for the provided `id` 
* `getRemainingLifetime (id) -> int`: returns the remaining lifetime in seconds for the provided `id` 

## Bundled Retrievers
### File Retriever
Reads data from a local file.

`createFileRetriever (defaults) -> function`
* `defaults`: default options passed to `fs.readFile`

```js
const { createFileRetriever } = require('octomore')

const readFile = createFileRetriever()

readFile('/path/to/foo.txt').then((data) => console.log(data))
```

### HTTP Retriever
Retrieves data from an HTTP endpoint (uses [request-promise](http://foo.bar) under the hood by default).

`createHttpRetriever (defaults, config) -> function`
* `defaults`: default options passed to `request-promise` on each request
* `config`: object
   * `requestFn`: function used to actually perform the HTTP request (defaults to `request-promise`)

```js
const { createHttpRetriever } = require('octomore')

// Send auth data for each request by default
const getData = createHttpRetriever({ auth: { user: 'admin', password: 'secret' } })

getData('https://my.api/v1/user/123').then((data) => console.dir(data))
```

## Bundled Cache Objects
### File Cache
Stores data in flat files, defaults to storing data in JSON format.

`createFileCache({ lifetime, directory, extension, json }) -> object`
* `lifetime`: cache lifetime in seconds (default `0`)
* `directory`: directory where cache files will be stored (default `cache`)
* `extension`: filename extension for cache files (default `json`)
* `json`: if `true`, data will be `JSON.stringify`'d before writing to disk and `JSON.parse`'d when retrieving (default `true`)

## Misc
### Testing
```
npm run test
```
### Debugging
octomore uses [debug](https://github.com/visionmedia/debug) - to activate debug output set the `DEBUG` environment variable to `octomore:*` (or whichever subset of output you're interested in).

```
DEBUG=octomore:* npm run test
```

### Todo
* Make debug output less verbose and more useful
