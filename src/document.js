const crypto = require('crypto')

const { noTransform } = require('./transformer')
const createPseudoCache = require('./cache/pseudo')
const { createLogger } = require('./logger')

const hashString = (str, algorithm = 'md5') => crypto.createHash(algorithm).update(str).digest('hex')

module.exports = function createDocument ({ retriever, getUri = (id) => `${id}`, transformer = noTransform, rawCache = false, transformedCache = false, getCacheId = hashString, friendlyName = 'Document', logger = createLogger('octomore:document') }) {
  if (typeof retriever !== 'function') {
    throw new Error('A retriever function must be provided when creating a document.')
  }

  if (typeof getUri !== 'function') {
    throw new Error('A getUri function must be provided when creating a document.')
  }

  const cache = { raw: rawCache || createPseudoCache(), transformed: transformedCache || createPseudoCache() }
  const isInCache = async (id, cache) => await cache.exists(id) && !(await cache.isOutdated(id))

  let getTransformedData = async (id, options) => {
    const getLogMessage = (msg) => `[${friendlyName} ${id}] ${msg}`
    const uri = await getUri(id, options)
    const cacheId = await getCacheId(uri)
    const cachedTransformedData = await isInCache(cacheId, cache.transformed)

    if (cachedTransformedData) {
      logger.verbose(getLogMessage('Returning cached transformed data for uri %s (cache id %s).', uri, cacheId))

      return cache.transformed.retrieve(cacheId)
    }

    const cachedRawData = await isInCache(cacheId, cache.raw)

    logger.verbose(getLogMessage('Retrieving raw data from %s, full uri is %s (cache id %s)'), cachedRawData ? 'cache' : 'source', uri, cacheId)

    const raw = cachedRawData ? await cache.raw.retrieve(cacheId) : await retriever(uri, options)

    logger.debug(getLogMessage('Raw data retrieved - applying transformation'))

    if (!cachedRawData) {
      await cache.raw.store(cacheId, raw)
    }

    const transformed = await transformer(raw)

    logger.debug(getLogMessage('Transformation applied'))

    await cache.transformed.store(cacheId, transformed)

    return transformed
  }

  getTransformedData.config = {
    retriever,
    rawCache,
    transformedCache,
    getUri,
    getCacheId
  }

  return getTransformedData
}
