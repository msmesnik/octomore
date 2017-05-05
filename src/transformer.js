const objectPath = require('object-path')
const Promise = require('bluebird')

const noTransform = (raw) => raw
const isExcluded = (targetSpec) => typeof targetSpec === 'boolean' && !targetSpec

function createTransformer (...specs) {
  specs.forEach(validateSpec)

  return async (rawData) => Promise.reduce(specs, async (data, spec, index) => {
    if (typeof spec === 'function') {
      return spec(data)
    }

    return Promise.reduce(Object.keys(spec), async (obj, targetProp) => {
      const targetSpec = spec[targetProp]

      if (isExcluded(targetSpec)) {
        return obj
      }

      return Object.assign({ }, obj, { [targetProp]: await getTransformedData(targetSpec, targetProp, data) })
    }, { })
  }, rawData)
}

function createAdditiveTransformer (...specs) {
  return async (rawData) => Promise.reduce(specs, async (data, spec) => {
    const applyTransform = createTransformer(spec)
    const transformed = await applyTransform(data)

    let obj = Object.assign({ }, data, transformed)

    Object.keys(spec).forEach((prop) => {
      if (isExcluded(spec[prop])) {
        delete obj[prop]
      }
    })

    return obj
  }, rawData)
}

function validateSpec (spec) {
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

async function getTransformedData (propSpec, targetProp, rawData) {
  const specType = typeof propSpec

  if (specType === 'boolean') {
    return rawData[targetProp]
  }

  if (specType === 'string') {
    return objectPath.get(rawData, propSpec)
  }

  if (specType === 'function') {
    return propSpec(rawData)
  }

  if (Array.isArray(propSpec)) {
    return Promise.all(propSpec.map(async (subSpec) => getTransformedData(subSpec, targetProp, rawData)))
  }

  if (specType === 'object') {
    const { src: sourceProp = targetProp, transform = noTransform, iterate } = propSpec
    const rawValue = objectPath.get(rawData, sourceProp)
    const applyTransform = typeof transform === 'object' ? createTransformer(transform) : transform

    if (iterate) {
      const isIterable = Array.isArray(rawValue)
      const iterable = typeof rawValue === 'undefined' ? [ ] : (isIterable ? rawValue : [ rawValue ])
      const { max = iterable.length } = propSpec

      return Promise.map(iterable.slice(0, max), applyTransform)
    }

    return applyTransform(rawValue)
  }
}

module.exports = {
  noTransform,
  createTransformer,
  createAdditiveTransformer,
  validateSpec,
  getTransformedData
}
