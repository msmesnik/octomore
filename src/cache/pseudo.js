'use strict'

export default function createPseudoCache () {
  return {
    getConfig: () => ({ }),
    exists: (id) => false,
    isOutdated: (id) => true,
    store: (id, data) => data,
    retrieve: (id) => undefined,
    getRemainingLifetime: (id) => 0
  }
}
