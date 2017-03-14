/* eslint-env mocha */

const { expect } = require('chai')
const path = require('path')

const { createFileRetriever } = require('../')

describe('retriever', function () {
  describe('file retriever', function () {
    it('returns contents of a file', async function () {
      const retrieveFile = createFileRetriever()
      const content = await retrieveFile(path.join(__dirname, 'mock/file.txt'))

      expect(content).to.be.a('string')
      expect(content.trim()).to.equal('text file')
    })
  })
})
