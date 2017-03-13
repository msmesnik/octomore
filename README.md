# octomore
[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg)](http://standardjs.com/)

octomore is an efficient, functional data retrieval and transformation library for node.js. It is named after the heavily peated [scotch whisky](https://www.bruichladdich.com/octomore) (which has absolutely nothing to do with this library). 

*This entire document is a work in progress.*

## Installation
```
npm install --save octomore
```

## Use Case
When writing APIs a common scenario is fetching data from one source, modifying bits of that data, perhaps removing some unused parts of it, and then returning that data to the client. Depending on the structure of the source data, as well as the complexity of the required modifications, this can be a trivial or a tedious task. Things get more complex still when the fetched source data contains values that need to be use to fetch another set of data from somewhere else (e.g. fetched user data containing a list of post ids, and fetching the post title for each one of them).

_WIP_

## Concepts

_WIP_

### Transformers
A transformer is an async function that receives raw source data and returns transformed output. Of course, this is the exact concept of a reducer (and [bluebirds](http://bluebirdjs.com/) `Promise.reduce` is exactly what powers much of the underlying mechanisms of octomore).  

#### `createTransformer` API
`createTransformer(function|object[, ...]) -> function`

`createTransformer` accepts an arbitrary number of parameters, each of which must be either a function or an object (these parameters will be referred to as `specifications` or `specs`). The async function returned by `createTransformer` expects raw source data and will apply each spec in sequence, passing it the data returned by the previous spec (again, exactly like `.reduce`).  

##### Function Specs
A spec function will receive one parameter - the source data -, be `await`ed and is expected to return transformed data. While this may not seem very useful on its own, it can be a powerful feature when combined in a chain of specs. 
 
When dealing with XML source data, for instance, this can be used as the first spec in the transformer chain to turn the XML string into an object (using [xml2js](https://github.com/Leonidas-from-XIV/node-xml2js) or something similar), which can be processed by an object spec in the next step. 

##### Object Specs
The real power of octomore lies in the declarative approach of object specs. These allow specifying the structure of the transformed output and applying transformation functions on several levels.
At its core, an object spec defines properties present in transformed output, mapping their values to values in source data. Like many things in programming, this is propably best illustrated by a simple, if somewhat contrived, example.

```js
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

All transformation functions can be async or Promise returning functions, and all source property names support (object-path)[https://github.com/mariocasciaro/object-path] notation. Since `createTransformer` returns a function, it can be used whereever transformation functions are supported. This means you can nest transformers for more complex scenarios while keeping the individual pieces small and testable.

### Documents

#### Retrievers

#### Caching
