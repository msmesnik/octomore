const createDocument = require('./document')
const createFileCache = require('./cache/file')
const createFileRetriever = require('./retriever/file')
const createHttpRetriever = require('./retriever/http')
const createPseudoCache = require('./cache/pseudo')
const { createTransformer, createAdditiveTransformer } = require('./transformer')

module.exports = {
  createAdditiveTransformer,
  createDocument,
  createFileCache,
  createFileRetriever,
  createHttpRetriever,
  createPseudoCache,
  createTransformer
}
