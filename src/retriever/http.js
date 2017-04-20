const request = require('request-promise')

module.exports = function createHttpRetriever (defaults = { }, { requestFn = request } = { }) {
  return async (uri, options = { }) => requestFn(Object.assign({ }, defaults, options, { uri }))
}
