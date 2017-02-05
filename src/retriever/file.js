'use strict'

import fs from 'fs'
import Promise from 'bluebird'

const readFileAsync = Promise.promisify(fs.readFile)

export default function createFileRetriever (defaults = { }) {
  return async (uri, options = { }) => await readFileAsync(uri, { encoding: 'utf8', ...defaults, ...options })
}
