/* eslint-env mocha */

const { expect } = require('chai')
const fs = require('fs')

const { verifyCacheProps } = require('./helpers/cache')
const createFileCache = require('../src/cache/file')

describe('file cache', function () {
  const directory = 'test/mock/cache'
  const createMockCache = (config = { }) => createFileCache(Object.assign({ directory }, config))
  const cleanup = (fullPath) => {
    try {
      fs.unlinkSync(fullPath)
    } catch (e) { }
  }

  it('exposes the correct properties', function () {
    verifyCacheProps(createFileCache(), expect)
  })

  it('returns cache config', function () {
    const cfg = { lifetime: 1, directory: 'foo', extension: 'bar' }
    const cache = createFileCache(cfg)

    const configured = cache.getConfig()

    expect(configured).to.be.an('object')
    expect(configured).to.deep.equal(cfg)
  })

  it('checks if a cache files exists', async function () {
    const cache = createMockCache()

    expect(await cache.exists('faux')).to.equal(false)
    expect(await cache.exists('mock')).to.equal(true)
  })

  it('retrieves cached content', async function () {
    const cache = createMockCache()
    const contents = await cache.retrieve('mock')

    expect(contents).to.be.an('object')
    expect(contents).to.deep.equal({ foo: 'bar' })
  })

  describe('storing', function () {
    const id = 'created'
    const fullPath = `${directory}/${id}.json`

    after(() => cleanup(fullPath))

    it('stores contents in a cache file', async function () {
      const cache = createMockCache()

      expect(() => fs.readFileSync(fullPath)).to.throw()

      await cache.store(id, 'foo')

      const contents = fs.readFileSync(fullPath, 'utf8')
      expect(contents).to.equal('"foo"')
    })
  })

  describe('removal', function () {
    const id = 'removed'
    const fullPath = `${directory}/${id}.json`

    before(() => fs.writeFileSync(fullPath, 'foo', 'utf8'))
    after(() => cleanup(fullPath))

    it('removes a cache file', async function () {
      const cache = createMockCache()

      expect(fs.readFileSync(fullPath, 'utf8')).to.equal('foo')

      await cache.remove(id)

      expect(() => fs.readFileSync(fullPath)).to.throw()
    })
  })

  describe('lifetime', function () {
    const id = 'lifetime'
    const fullPath = `${directory}/${id}.json`
    const cache = createMockCache({ lifetime: 5 })

    before(() => fs.writeFileSync(fullPath, 'foo', 'utf8'))
    after(() => cleanup(fullPath))

    it('returns remaining lifetime in seconds', async function () {
      expect(await cache.getRemainingLifetime('mock')).to.equal(0)
      expect(await cache.getRemainingLifetime('lifetime')).to.be.within(4, 5)
    })

    it('determines if a cache file is outdated', async function () {
      expect(await cache.isOutdated('mock')).to.equal(true)
      expect(await cache.isOutdated('lifetime')).to.equal(false)
    })
  })
})
