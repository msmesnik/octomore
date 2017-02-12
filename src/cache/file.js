'use strict'

import getDebugger from 'debug'
import fs from 'fs-extra'
import path from 'path'
import Promise from 'bluebird'

const debug = getDebugger('octomore:cache:file')

Promise.promisifyAll(fs)

export default function createFileCache ({ lifetime = 0, directory = 'cache', extension = 'json' } = { }) {
  debug('Creating file cache object. Lifetime is %s sec, cache directory is "%s", file extension is "%s".', lifetime, directory, extension)

  const getFullPath = (id) => path.join(directory, `${id}.${extension}`)

  return {
    getConfig: () => ({ lifetime, directory, extension }),
    exists: async (id) => {
      const fullPath = getFullPath(id)

      debug('Checking if file %s exists', fullPath)

      try {
        await fs.accessAsync(fullPath)

        debug('File %s exists', fullPath)

        return true
      } catch (e) {
        debug('File %s does not exists (error message: %s)', fullPath, e.message)

        return false
      }
    },
    isOutdated: (id) => undefined,
    store: (id, data) => undefined,
    retrieve: (id) => undefined,
    remove: (id) => undefined,
    getRemainingLifetime: (id) => undefined
  }
}
