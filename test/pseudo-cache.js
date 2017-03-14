/* eslint-env mocha */

import { expect } from 'chai'

import { verifyCacheProps } from './helpers/cache'
import createPseudoCache from '../src/cache/pseudo'

describe('pseudo cache', function () {
  it('exposes the correct properties', function () {
    verifyCacheProps(createPseudoCache(), expect)
  })
})
