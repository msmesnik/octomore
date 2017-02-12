'use strict'

import getDebugger from 'debug'
import fs from 'fs'
import Promise from 'bluebird'

const debug = getDebugger('octomore:cache:file')

export default function createFileCache ({ lifetime = 0, directory = 'cache', extension = 'json' } = { }) {
  return {
    lifetime: () => lifetime,
    exists: (uri) => false,
    isOutdated: (uri) => true,
    store: (uri, data) => data,
    retrieve: (uri) => undefined,
    getRemainingLifetime: (uri) => lifetime
  }
}
