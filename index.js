const createDocument = require('./dist/document')
const createFileCache = require('./dist/cache/file')
const createFileRetriever = require('./dist/retriever/file')
const createHttpRetriever = require('./dist/retriever/http')
const createPseudoCache = require('./dist/cache/pseudo')
const { createTransformer, createAdditiveTransformer } = require('./dist/transformer')

module.exports = {
  createAdditiveTransformer,
  createDocument,
  createFileCache,
  createFileRetriever,
  createHttpRetriever,
  createPseudoCache,
  createTransformer
}
