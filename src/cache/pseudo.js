'use strict'

export default function createPseudoCache () {
  return {
    lifetime: () => 0,
    exists: (uri) => false,
    isOutdated: (uri) => true,
    store: (uri, data) => data,
    retrieve: (uri) => undefined,
    getRemainingLifetime: (uri) => 0
  }
}
