'use strict'

import getDebugger from 'debug'

import { noTransform } from './transform'

const debug = getDebugger('octomore:document')

export default function defineDocument ({ retriever, transformer = noTransform }) {
  if (typeof retriever !== 'function') {
    throw new Error('A retriever function must be provided when defining a document.')
  }

  let getTransformedData = async (id, options) => {
    return 'transformed'
  }

  getTransformedData.retriever = retriever
  getTransformedData.cache = async () => 'cache'

  return getTransformedData
}
