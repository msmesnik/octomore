'use strict'

export default function createPseudoCache () {
  return {
    getConfig: () => ({ }),
    exists: (uri) => false,
    isOutdated: (uri) => true,
    store: (uri, data) => data,
    retrieve: (uri) => undefined,
    getRemainingLifetime: (uri) => 0
  }
}
