'use strict'

/* eslint-env mocha */

import { expect } from 'chai'

import defineDocument, * as d from '../src/document'

describe('document', function () {
  describe('validation', function () {
    it('requires a retriever function', function () {
      expect(() => defineDocument({ })).to.throw()
      expect(() => defineDocument({ retriever: false })).to.throw()
      expect(() => defineDocument({ retriever: { } })).to.throw()
      expect(() => defineDocument({ retriever: 'foo' })).to.throw()
      expect(() => defineDocument({ retriever: [ ] })).to.throw()
      expect(() => defineDocument({ retriever: () => undefined })).to.not.throw()
    })
  })

  describe('function composition', function () {
    it('does things', async function () {
      const doc = defineDocument({ retriever: () => 'ret' })

      console.log(await doc())
      console.log(await doc.retriever())
      console.log(await doc.cache())
    })
  })
})
