const fs = require('fs')
const Promise = require('bluebird')

const readFileAsync = Promise.promisify(fs.readFile)

module.exports = function createFileRetriever (defaults = { }) {
  return async (uri, options = { }) => await readFileAsync(uri, { encoding: 'utf8', ...defaults, ...options })
}
