const request = require('request-promise')

module.exports = function createHttpRetriever (defaults = { }) {
  return async (uri, options = { }) => await request({ ...defaults, ...options, uri })
}
