'use strict'

/* eslint-env mocha */

import { expect } from 'chai'

import createDocument, * as d from '../src/document'

describe('document', function () {
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

  it('returns a function', async function () {
    const doc = createDocument({ uriTemplate: '', retriever: () => undefined })

    expect(doc).to.be.a('function')
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
