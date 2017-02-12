'use strict'

/* eslint-env mocha */

import { expect } from 'chai'

import { verifyCacheProps } from './helpers/cache'
import createFileCache from '../src/cache/file'

describe('file cache', function () {
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
})
