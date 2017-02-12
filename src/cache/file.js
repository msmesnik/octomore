'use strict'

import getDebugger from 'debug'
import fs from 'fs-extra'
import Promise from 'bluebird'

const debug = getDebugger('octomore:cache:file')

Promise.promisifyAll(fs)

export default function createFileCache ({ lifetime = 0, directory = 'cache', extension = 'json' } = { }) {
  debug('Creating file cache object. Lifetime is %s sec, cache directory is "%s", file extension is "%s".', lifetime, directory, extension)

  return {
    getConfig: () => ({ lifetime, directory, extension }),
    exists: (uri) => undefined,
    isOutdated: (uri) => undefined,
    store: (uri, data) => undefined,
    retrieve: (uri) => undefined,
    getRemainingLifetime: (uri) => undefined
  }
}
