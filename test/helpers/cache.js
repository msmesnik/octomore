'use strict'

export const propTypes = {
  lifetime: 'function',
  exists: 'function',
  isOutdated: 'function',
  store: 'function',
  retrieve: 'function',
  getRemainingLifetime: 'function'
}

export function verifyCacheProps (cache, expect) {
  const props = Object.keys(propTypes)

  expect(cache).to.be.an('object')
  expect(cache).to.have.all.keys(props)

  props.forEach((prop) => {
    expect(typeof cache[prop]).to.equal(propTypes[prop])
  })
}
