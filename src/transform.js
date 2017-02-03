'use strict'

export default function getTransformer (spec) {
  validateSpec(spec)

  // const keys = Object.keys(spec)
  if (typeof spec === 'function') {
    return async (raw) => await spec(raw)
  }

  return async (raw) => {
    return raw
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
