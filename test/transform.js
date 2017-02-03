'use strict'

/* eslint-env mocha */

import { expect } from 'chai'

import getTransformer, * as t from '../src/transform'

describe('data transformer', function () {
  it('accepts only functions and objects', function () {
    expect(() => getTransformer()).to.throw()
    expect(() => getTransformer('foo')).to.throw()
    expect(() => getTransformer(1)).to.throw()
    expect(() => getTransformer(() => undefined)).to.not.throw()
    expect(() => getTransformer({ })).to.not.throw()
  })

  it('returns a function', function () {
    expect(getTransformer(() => undefined)).to.be.a('function')
    expect(getTransformer({ })).to.be.a('function')
  })
})
