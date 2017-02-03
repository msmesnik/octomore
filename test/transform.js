'use strict'

/* eslint-env mocha */

import { expect } from 'chai'

import getTransformer, * as t from '../src/transform'

describe('data transformer', function () {
  describe('spec validation', function () {
    it('accepts only functions and objects', function () {
      expect(() => t.validateSpec()).to.throw()
      expect(() => t.validateSpec('foo')).to.throw()
      expect(() => t.validateSpec(1)).to.throw()
      expect(() => t.validateSpec(() => undefined)).to.not.throw()
      expect(() => t.validateSpec({ })).to.not.throw()
    })

    // it('requires valid transform specs', function () {
    // })
  })

  describe('transformer', function () {
    it('returns a function', function () {
      expect(getTransformer(() => undefined)).to.be.a('function')
      expect(getTransformer({ })).to.be.a('function')
    })

    it('applies top level transform function', async function () {
      const applyTransform = getTransformer((raw) => `${raw}_transformed`)

      expect(await applyTransform('raw')).to.equal('raw_transformed')
    })
  })
})
