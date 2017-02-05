'use strict'

export default function createPseudoCache ({ lifetime = 0 } = { }) {
  return {
    lifetime: () => lifetime,
    getId: (uri) => uri,
    exists: (uri) => false,
    isOutdated: (uri) => true,
    store: (uri, data) => data,
    retrieve: (uri) => undefined,
    getRemainingLifetime: (uri) => lifetime
  }
}
