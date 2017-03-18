const crypto = require('crypto')
const getDebugger = require('debug')

const { noTransform } = require('./transformer')
const createPseudoCache = require('./cache/pseudo')

const debug = getDebugger('octomore:document')
const hashString = (str, algorithm = 'md5') => crypto.createHash(algorithm).update(str).digest('hex')

module.exports = function defineDocument ({ retriever, uriTemplate, getUri = (id) => `${id}`, transformer = noTransform, rawCache = false, transformedCache = false, getCacheId = hashString, friendlyName = 'Document' }) {
  if (typeof retriever !== 'function') {
    throw new Error('A retriever function must be provided when defining a document.')
  }

  if (typeof getUri !== 'function' && typeof uriTemplate !== 'string') {
    throw new Error('You must provide either an "uriTemplate" string or a "getUri" function when creating a new document.')
  }

  const cache = { raw: rawCache || createPseudoCache(), transformed: transformedCache || createPseudoCache() }
  const getFullUri = uriTemplate ? (id) => uriTemplate.replace(/\{id\}/i, id) : getUri
  const isInCache = async (id, cache) => await cache.exists(id) && !(await cache.isOutdated(id))

  let getTransformedData = async (id, options) => {
    const debugDoc = (msg, ...params) => debug(`[%s %s] ${msg}`, friendlyName, id, ...params)
    const uri = await getFullUri(id, options)
    const cacheId = await getCacheId(uri)
    const cachedTransformedData = await isInCache(cacheId, cache.transformed)

    if (cachedTransformedData) {
      debug('Returning cached transformed data for uri %s (cache id %s).', uri, cacheId)

      return await cache.transformed.retrieve(cacheId)
    }

    const cachedRawData = await isInCache(cacheId, cache.raw)

    debugDoc('Retrieving raw data from %s, full uri is %s (cache id %s)', cachedRawData ? 'cache' : 'source', uri, cacheId)

    const raw = cachedRawData ? await cache.raw.retrieve(cacheId) : await retriever(uri, options)

    debugDoc('Raw data retrieved - applying transformation')

    if (!cachedRawData) {
      await cache.raw.store(cacheId, raw)
    }

    const transformed = await transformer(raw)

    debugDoc('Transformation applied')

    await cache.transformed.store(cacheId, transformed)

    return transformed
  }

  getTransformedData.config = {
    retriever,
    rawCache,
    transformedCache,
    getFullUri,
    getCacheId
  }

  return getTransformedData
}
