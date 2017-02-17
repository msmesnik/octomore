'use strict'

import crypto from 'crypto'
import getDebugger from 'debug'

import { noTransform } from './transformer'
import createPseudoCache from './cache/pseudo'

const debug = getDebugger('octomore:document')
const hashString = (str, algorithm = 'md5') => crypto.createHash(algorithm).update(str).digest('hex')

export default function defineDocument ({ retriever, uriTemplate, getUri = (id) => `${id}`, transformer = noTransform, rawCache = createPseudoCache(), transformedCache = createPseudoCache(), getCacheId = hashString, friendlyName = 'Document' }) {
  if (typeof retriever !== 'function') {
    throw new Error('A retriever function must be provided when defining a document.')
  }

  if (typeof getUri !== 'function' && typeof uriTemplate !== 'string') {
    throw new Error('You must provide either an "uriTemplate" string or a "getUri" function when creating a new document.')
  }

  const getFullUri = uriTemplate ? (id) => uriTemplate.replace(/\{id\}/i, id) : getUri
  const isInCache = async (id, cache) => await cache.exists(id) && !(await cache.isOutdated(id))

  let getTransformedData = async (id, options) => {
    const debugDoc = (msg, ...params) => debug(`[%s %s] ${msg}`, friendlyName, id, ...params)
    const uri = await getFullUri(id, options)
    const cacheId = await getCacheId(uri)
    const cachedTransformedData = await isInCache(cacheId, transformedCache)

    if (cachedTransformedData) {
      debug('Returning cached transformed data for uri %s (cache id %s).', uri, cacheId)

      return await transformedCache.retrieve(cacheId)
    }

    const cachedRawData = await isInCache(cacheId, rawCache)

    debugDoc('Retrieving raw data from %s, full uri is %s (cache id %s)', cachedRawData ? 'cache' : 'source', uri, cacheId)

    const raw = cachedRawData ? await rawCache.retrieve(cacheId) : await retriever(uri, options)

    debugDoc('Raw data retrieved - applying transformation')

    if (!cachedRawData) {
      await rawCache.store(cacheId, raw)
    }

    const transformed = await transformer(raw)

    debugDoc('Transformation applied')

    await transformedCache.store(cacheId, transformed)

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
