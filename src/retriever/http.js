'use strict'

// import getDebugger from 'debug'
import request from 'request-promise'

// const debug = getDebugger('octomore:retriver:http')

export default function createHttpRetriever (defaults = { }) {
  return async (uri, options = { }) => await request({ ...defaults, ...options, uri })
}
