'use strict'

import objectPath from 'object-path'
import Promise from 'bluebird'

const noTransform = (raw) => raw

export default function getTransformer (spec) {
  validateSpec(spec)

  // const keys = Object.keys(spec)
  if (typeof spec === 'function') {
    return async (raw) => await spec(raw)
  }

  return async (raw) => {
    const arr = await Promise.all(Object.keys(spec).map(async (targetProp) => {
      const propSpec = spec[targetProp]
      const specType = typeof propSpec

      if (specType === 'boolean') {
        return [ targetProp, raw[targetProp] ]
      }

      if (specType === 'string') {
        return [ targetProp, objectPath.get(raw, propSpec) ]
      }

      if (specType === 'function') {
        return [ targetProp, await propSpec(raw) ]
      }

      if (specType === 'object') {
        const { src: sourceProp, transform = noTransform } = propSpec

        return [ targetProp, await transform(objectPath.get(raw, sourceProp)) ]
      }
    }))

    return arr.reduce((obj, [ prop, val ]) => ({ ...obj, [prop]: val }), { })
  }
}

export function validateSpec (spec) {
  const specType = typeof spec
  const isFunction = specType === 'function'
  const isObject = specType === 'object'

  if (!isFunction && !isObject) {
    throw new Error('getTransformer accepts only functions or objects as its parameter.')
  }
}
