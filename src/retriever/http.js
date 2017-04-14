const request = require('request-promise')

module.exports = function createHttpRetriever (defaults = { }) {
  return async (uri, options = { }) => request(Object.assign({ }, defaults, options, { uri }))
}
