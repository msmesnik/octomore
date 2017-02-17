'use strict'

import request from 'request-promise'

export default function createHttpRetriever (defaults = { }) {
  return async (uri, options = { }) => await request({ ...defaults, ...options, uri })
}
