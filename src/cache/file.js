'use strict'

import getDebugger from 'debug'
import fs from 'fs-extra'
import path from 'path'
import Promise from 'bluebird'

const debug = getDebugger('octomore:cache:file')

Promise.promisifyAll(fs)

export default function createFileCache ({ lifetime = 0, directory = 'cache', extension = 'json' } = { }) {
  debug('Creating file cache object. Lifetime is %s sec, cache directory is "%s", file extension is "%s".', lifetime, directory, extension)

  const getFullPath = (id) => path.resolve(directory, `${id}.${extension}`)

  const getConfig = () => ({ lifetime, directory, extension })
  const exists = async (id) => {
    const fullPath = getFullPath(id)

    debug('Checking if file %s exists', fullPath)

    try {
      await fs.accessAsync(fullPath)

      debug('File %s exists', fullPath)

      return true
    } catch (e) {
      debug('Cannot access file %s (error message: %s)', fullPath, e.message)

      return false
    }
  }
  const store = async (id, data) => {
    const fullPath = getFullPath(id)

    debug('Attempting to write cache file %s', fullPath)

    await fs.ensureDirAsync(path.dirname(fullPath))
    await fs.writeFileAsync(fullPath, JSON.stringify(data), { encoding: 'utf8' })

    debug('Cache file %s written', fullPath)
  }
  const retrieve = async (id) => {
    const fullPath = getFullPath(id)

    debug('Attempting to read cache file %s', fullPath)

    const raw = await fs.readFileAsync(fullPath, 'utf8')

    debug('Cache file %s read, JSON.parse()ing contents.', fullPath)

    return JSON.parse(raw)
  }
  const remove = async (id) => {
    const fullPath = getFullPath(id)

    debug('Attempting to remove cache file %s', fullPath)

    await fs.unlinkAsync(fullPath)

    debug('Cache file %s removed', fullPath)
  }
  const getRemainingLifetime = async (id) => {
    const fullPath = getFullPath(id)

    const { mtime } = await fs.statAsync(fullPath)
    const now = new Date()
    const age = (now - mtime) / 1000
    const remaining = age >= lifetime ? 0 : lifetime - age

    debug('mtime for cache file %s is %s, now is %s, age is therefore %s sec. Lifetime is %s sec, thus %s sec remain.', fullPath, mtime, now, age, lifetime, remaining)

    return remaining
  }
  const isOutdated = async (id) => await getRemainingLifetime(id) === 0

  return {
    getConfig,
    exists,
    store,
    retrieve,
    remove,
    getRemainingLifetime,
    isOutdated
  }
}
