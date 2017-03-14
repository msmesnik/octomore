/* eslint-env mocha */

const { expect } = require('chai')

const { verifyCacheProps } = require('./helpers/cache')
const createPseudoCache = require('../src/cache/pseudo')

describe('pseudo cache', function () {
  it('exposes the correct properties', function () {
    verifyCacheProps(createPseudoCache(), expect)
  })
})
