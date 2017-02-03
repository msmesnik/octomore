'use strict'

import objectPath from 'object-path'
import Promise from 'bluebird'

const noTransform = (raw) => raw

export default function getTransformer (...specs) {
  specs.forEach(validateSpec)

  return async (rawData) => await Promise.reduce(specs, async (data, spec) => {
    if (typeof spec === 'function') {
      return await spec(data)
    }

    return await Promise.reduce(Object.keys(spec), async (obj, targetProp) => {
      return {
        ...obj,
        [targetProp]: await getTransformedData(spec[targetProp], targetProp, data)
      }
    }, { })
  }, rawData)
}

export function validateSpec (spec) {
  const specType = typeof spec
  const isFunction = specType === 'function'
  const isObject = specType === 'object'

  if (!isFunction && !isObject) {
    throw new Error('getTransformer accepts only functions or objects as its parameter.')
  }

  const validTypes = [ 'boolean', 'string', 'function', 'object' ]

  Object.keys(spec).forEach((targetProp) => {
    const specType = typeof spec[targetProp]

    if (!validTypes.includes(specType)) {
      throw new Error(`Invalid specification encountered for property ${targetProp}. Must be one of [${validTypes.join(' | ')}] but found ${specType}.`)
    }
  })
}

export async function getTransformedData (propSpec, targetProp, rawData) {
  const specType = typeof propSpec

  if (specType === 'boolean') {
    return rawData[targetProp]
  }

  if (specType === 'string') {
    return objectPath.get(rawData, propSpec)
  }

  if (specType === 'function') {
    return await propSpec(rawData)
  }

  if (specType === 'object') {
    if (Array.isArray(propSpec)) {
      return await Promise.all(propSpec.map(async (subSpec) => await getTransformedData(subSpec, targetProp, rawData)))
    }

    const { src: sourceProp = targetProp, transform = noTransform, iterate } = propSpec
    const rawValue = objectPath.get(rawData, sourceProp)

    if (iterate) {
      const isIterable = Array.isArray(rawValue)
      const iterable = isIterable ? rawValue : [ rawValue ]

      if (!isIterable) {
        console.warn('Attempted to iterate over non-array property %s. Coerced it into an array.', sourceProp)
      }

      return await Promise.map(iterable.slice(0, propSpec.max || iterable.length), transform)
    }

    return await transform(rawValue)
  }
}
