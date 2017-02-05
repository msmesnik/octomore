'use strict'

import getDebugger from 'debug'

import { noTransform } from './transformer'
import createPseudoCache from './cache/pseudo'

const debug = getDebugger('octomore:document')

export default function defineDocument ({ retriever, uriTemplate, getUri, transformer = noTransform, rawCache = createPseudoCache(), transformedCache = createPseudoCache(), friendlyName = 'Document' }) {
  if (typeof retriever !== 'function') {
    throw new Error('A retriever function must be provided when defining a document.')
  }

  if (typeof getUri !== 'function' && typeof uriTemplate !== 'string') {
    throw new Error('You must provide either an "uriTemplate" string or a "getUri" function when creating a new document.')
  }

  const getFullUri = getUri || ((id) => uriTemplate.replace(/\{id\}/i, id))

  let getTransformedData = async (id, options) => {
    const debugDoc = (msg, ...params) => debug(`[%s %s] ${msg}`, friendlyName, id, ...params)
    const uri = await getFullUri(id, options)

    debugDoc('Retrieving raw data, full uri is %s', uri)

    const raw = await retriever(uri, options)

    debugDoc('Raw data retrieved - applying transformation')

    const transformed = await transformer(raw)

    debugDoc('Transformation applied')

    return transformed
  }

  getTransformedData.retriever = retriever
  getTransformedData.cache = { raw: rawCache, transformed: transformedCache }

  return getTransformedData
}
