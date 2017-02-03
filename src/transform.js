'use strict'

export default function getTransformer (spec) {
  const specType = typeof spec
  const isFunction = specType === 'function'
  const isObject = specType === 'object'

  if (!isFunction && !isObject) {
    throw new Error('getTransformer accepts only functions or objects as its parameter.')
  }

  if (isFunction) {
    return async (raw) => await spec(raw)
  }

  // const keys = Object.keys(spec)

  return async (raw) => {
    return raw
  }
}
