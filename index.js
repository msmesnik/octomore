const createDocument = require('./lib/document')
const createFileCache = require('./lib/cache/file')
const createFileRetriever = require('./lib/retriever/file')
const createHttpRetriever = require('./lib/retriever/http')
const createPseudoCache = require('./lib/cache/pseudo')
const { createTransformer, createAdditiveTransformer } = require('./lib/transformer')

module.exports = {
  createAdditiveTransformer,
  createDocument,
  createFileCache,
  createFileRetriever,
  createHttpRetriever,
  createPseudoCache,
  createTransformer
}
