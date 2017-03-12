'use strict'

import getDebugger from 'debug'
import objectPath from 'object-path'
import Promise from 'bluebird'

const debug = getDebugger('octomore:transformer')
export const noTransform = (raw) => raw

export default function createTransformer (...specs) {
  debug('Creating transformer for %s specs', specs.length)

  specs.forEach(validateSpec)

  return async (rawData) => await Promise.reduce(specs, async (data, spec, index) => {
    if (typeof spec === 'function') {
      debug('Spec at index %s is a function', index)

      return await spec(data)
    }

    debug('Spec at index %s is an object', index)

    return await Promise.reduce(Object.keys(spec), async (obj, targetProp) => {
      return {
        ...obj,
        [targetProp]: await getTransformedData(spec[targetProp], targetProp, data)
      }
    }, { })
  }, rawData)
}

export function createAdditiveTransformer (...specs) {
  return async (rawData) => await Promise.reduce(specs, async (data, spec) => {
    const applyTransform = createTransformer(spec)
    const transformed = await applyTransform(data)

    return { ...data, ...transformed }
  }, rawData)
}

export function validateSpec (spec) {
  const specType = typeof spec
  const isFunction = specType === 'function'
  const isObject = specType === 'object'

  if (!isFunction && !isObject) {
    throw new Error('createTransformer accepts only functions or objects as its parameter.')
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
    debug('Including property "%s" as is (boolean spec)', targetProp)

    return rawData[targetProp]
  }

  if (specType === 'string') {
    debug('Mapping original name "%s" to target property "%s"', propSpec, targetProp)

    return objectPath.get(rawData, propSpec)
  }

  if (specType === 'function') {
    debug('Calling first-level transform function for property "%s"', targetProp)

    return await propSpec(rawData)
  }

  if (Array.isArray(propSpec)) {
    debug('Array of specs encountered for property "%s" - recursing', targetProp)

    return await Promise.all(propSpec.map(async (subSpec) => await getTransformedData(subSpec, targetProp, rawData)))
  }

  if (specType === 'object') {
    const { src: sourceProp = targetProp, transform = noTransform, iterate } = propSpec
    const rawValue = objectPath.get(rawData, sourceProp)
    const applyTransform = typeof transform === 'object' ? createTransformer(transform) : transform

    if (iterate) {
      const isIterable = Array.isArray(rawValue)
      const iterable = isIterable ? rawValue : [ rawValue ]
      const { max = iterable.length } = propSpec

      debug('Target "%s" - iterating over value of source property "%s" (max %s items)', targetProp, sourceProp, max)

      if (!isIterable) {
        console.warn('Attempted to iterate over non-array property "%s". Coerced it into an array.', sourceProp)
      }

      return await Promise.map(iterable.slice(0, max), applyTransform)
    }

    return await applyTransform(rawValue)
  }
}
