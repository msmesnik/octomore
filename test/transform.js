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
    const mockData = require('./mock/raw.json')

    it('returns a function', function () {
      expect(getTransformer(() => undefined)).to.be.a('function')
      expect(getTransformer({ })).to.be.a('function')
    })

    it('applies top level transform function', async function () {
      const applyTransform = getTransformer((raw) => `${raw}_transformed`)

      expect(await applyTransform('raw')).to.equal('raw_transformed')
    })

    it('allows boolean specs', async function () {
      const applyTransform = getTransformer({
        'string': true
      })

      expect(await applyTransform(mockData)).to.deep.equal({ string: 'some string' })
    })

    it('allows renaming properties', async function () {
      const applyTransform = getTransformer({
        'altered': 'string'
      })

      expect(await applyTransform(mockData)).to.deep.equal({ altered: 'some string' })
    })

    it('allows explicitly specifying source prop', async function () {
      const applyTransform = getTransformer({
        'explicit': { src: 'string' }
      })

      expect(await applyTransform(mockData)).to.deep.equal({ explicit: 'some string' })
    })

    it('allows deep property access', async function () {
      const applyTransform = getTransformer({
        'first': 'nested.prop',
        'second': { src: 'nested.prop' }
      })

      expect(await applyTransform(mockData)).to.deep.equal({ first: 'value', second: 'value' })
    })

    it('passes all raw data to first level transform functions', async function () {
      const applyTransform = getTransformer({
        'aggregate': (raw) => raw
      })

      const transformed = await applyTransform(mockData)
      expect(transformed.aggregate).to.deep.equal(mockData)
    })

    it('passes only value of source property to second level transform functions', async function () {
      const applyTransform = getTransformer({
        'transformed': { src: 'string', transform: (str) => `transformed ${str}` }
      })

      expect(await applyTransform(mockData)).to.deep.equal({ transformed: 'transformed some string' })
    })
  })
})
