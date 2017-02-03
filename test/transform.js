'use strict'

/* eslint-env mocha */

import { expect } from 'chai'

import getTransformer, * as t from '../src/transform'

describe('data transformer', function () {
  const mockData = require('./mock/raw.json')

  describe('spec validation', function () {
    it('accepts only functions and objects', function () {
      expect(() => t.validateSpec()).to.throw()
      expect(() => t.validateSpec('foo')).to.throw()
      expect(() => t.validateSpec(1)).to.throw()
      expect(() => t.validateSpec(() => undefined)).to.not.throw()
      expect(() => t.validateSpec({ })).to.not.throw()
    })

    it('requires valid transform specs', function () {
      expect(() => t.validateSpec({ foo: 1 })).to.throw()
    })
  })

  describe('specifications', function () {
    it('applies top level transform function', async function () {
      const applyTransform = getTransformer((raw) => `${raw}_transformed`)

      expect(await applyTransform('raw')).to.equal('raw_transformed')
    })

    it('allows boolean specs (include property as is)', async function () {
      const applyTransform = getTransformer({
        'string': true
      })

      expect(await applyTransform(mockData)).to.deep.equal({ string: 'some string' })
    })

    it('allows string specs (rename property)', async function () {
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

    it('allows async transform functions', async function () {
      const transform = async (raw) => await new Promise((resolve) => setTimeout(() => resolve(`promised ${raw}`), 100))
      const applyTransform = getTransformer({
        'string': { transform }
      })

      expect(await applyTransform(mockData)).to.deep.equal({ 'string': 'promised some string' })
    })

    it('allows array specs', async function () {
      const applyTransform = getTransformer({
        'arr': [
          'string',
          'nested.prop',
          { src: 'number', transform: (num) => num + 1 }
        ]
      })

      const { arr } = await applyTransform(mockData)
      expect(arr).to.have.all.members([ 'some string', 'value', 2.234 ])
    })

    it('allows iterating over arrays', async function () {
      const applyTransform = getTransformer({
        'subset': { src: 'list', transform: (num) => `number: ${num}`, iterate: true, max: 4 }
      })

      const { subset } = await applyTransform(mockData)

      expect(subset).to.be.an('array')
      expect(subset.length).to.equal(4)

      subset.forEach((item, index) => {
        expect(item).to.be.a('string')
        expect(item).to.equal(`number: ${index}`)
      })
    })
  })

  describe('function composition', function () {
    it('returns a function', function () {
      expect(getTransformer(() => undefined)).to.be.a('function')
      expect(getTransformer({ })).to.be.a('function')
    })

    it('calls transformers sequentially', async function () {
      const first = (raw) => Object.assign({ }, raw, { added: 'value' })
      const second = {
        added: true,
        number: true,
        final: { src: 'added', transform: (str) => `transformed ${str}` },
        list: { transform: (list) => list.slice(0, 3) }
      }

      const applyTransform = getTransformer(first, second)
      const transformed = await applyTransform(mockData)

      expect(transformed).to.have.all.keys([ 'added', 'number', 'final', 'list' ])
      expect(transformed.number).to.equal(1.234)
      expect(transformed.added).to.equal('value')
      expect(transformed.final).to.equal('transformed value')
      expect(transformed.list).to.deep.equal([ 0, 1, 2 ])
    })
  })
})
