'use strict'

/* eslint-env mocha */

import { expect } from 'chai'

import createDocument from '../src/document'

describe('document', function () {
  describe('general functionality', function () {
    it('requires a retriever function', function () {
      const create = (opts) => createDocument({ uriTemplate: '', ...opts })

      expect(() => create({ })).to.throw()
      expect(() => create({ retriever: false })).to.throw()
      expect(() => create({ retriever: { } })).to.throw()
      expect(() => create({ retriever: 'foo' })).to.throw()
      expect(() => create({ retriever: [ ] })).to.throw()
      expect(() => create({ retriever: () => undefined })).to.not.throw()
    })

    it('requires either an uriTemplate string or a getUri function', function () {
      const create = (opts) => createDocument({ retriever: () => undefined, ...opts })

      expect(() => create({ })).to.throw()
      expect(() => create({ uriTemplate: false })).to.throw()
      expect(() => create({ uriTemplate: () => '' })).to.throw()
      expect(() => create({ uriTemplate: '' })).to.not.throw()

      expect(() => create({ getUri: false })).to.throw()
      expect(() => create({ getUri: '' })).to.throw()
      expect(() => create({ getUri: () => '' })).to.not.throw()
    })

    it('returns a function that also exposes a "config" object', async function () {
      const doc = createDocument({ uriTemplate: '', retriever: () => undefined })

      expect(doc).to.be.a('function')
      expect(doc.config).to.be.an('object')
      expect(doc.config).to.have.all.keys([ 'retriever', 'rawCache', 'transformedCache', 'getFullUri', 'getCacheId' ])
    })

    it('retrieves data and applies transformation', async function () {
      const retriever = (id) => `id: ${id}`
      const transformer = (data) => ({ transformed: data })

      const doc = createDocument({ uriTemplate: '{id}', retriever, transformer })
      const data = await doc(1)

      expect(data).to.be.an('object')
      expect(data).to.have.all.keys([ 'transformed' ])
      expect(data.transformed).to.equal('id: 1')
    })
  })

  describe('cache: retrieval', function () {
    // Creates a cache object that will always return the string "cached" for any resource
    const createMockCache = () => ({
      getId: (uri) => uri,
      exists: (uri) => true,
      isOutdated: (uri) => false,
      store: (uri, data) => data,
      retrieve: (uri) => 'cached',
      getRemainingLifetime: (uri) => 100
    })

    it('returns cached raw data', async function () {
      // Since the default transformer does nothing, this will return "fresh" without caching
      const doc = createDocument({
        retriever: () => 'fresh',
        uriTemplate: '',
        rawCache: createMockCache()
      })

      expect(await doc()).to.equal('cached')
    })

    it('returns cached transformed data', async function () {
      // Returns "transformed fresh" without caching
      const doc = createDocument({
        retriever: () => 'fresh',
        transformer: (raw) => `transformed ${raw}`,
        uriTemplate: '',
        transformedCache: createMockCache()
      })

      expect(await doc()).to.equal('cached')
    })
  })

  describe('cache: storing', function () {
    // Creates a cache object that will simply push data to an array when "storing"
    const createMockCache = () => {
      let cachedItems = [ ]

      return {
        getId: (uri) => uri,
        exists: (uri) => false,
        isOutdated: (uri) => true,
        store: (uri, data) => {
          cachedItems.push(data)
          return data
        },
        retrieve: (uri) => 'cached',
        getRemainingLifetime: (uri) => 0,
        getCachedItems: () => cachedItems
      }
    }

    it('stores raw data in cache after retrieving', async function () {
      const cache = createMockCache()
      const doc = createDocument({
        retriever: () => 'fresh',
        uriTemplate: '',
        rawCache: cache
      })

      expect(cache.getCachedItems().length).to.equal(0)

      await doc()

      const items = await cache.getCachedItems()

      expect(items.length).to.equal(1)
      expect(items[0]).to.equal('fresh')
    })

    it('stores transformed data in cache after transforming', async function () {
      const cache = createMockCache()
      const doc = createDocument({
        retriever: () => 'fresh',
        transformer: () => 'transformed',
        uriTemplate: '',
        transformedCache: cache
      })

      expect(cache.getCachedItems().length).to.equal(0)

      await doc()

      const items = await cache.getCachedItems()

      expect(items.length).to.equal(1)
      expect(items[0]).to.equal('transformed')
    })
  })
})
