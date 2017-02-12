'use strict'

/* eslint-env mocha */

import { expect } from 'chai'

import { verifyCacheProps } from './helpers/cache'
import createFileCache from '../src/cache/file'

describe('file cache', function () {
  it('exposes the correct properties', function () {
    verifyCacheProps(createFileCache(), expect)
  })
})
