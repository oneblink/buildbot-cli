'use strict'

const test = require('ava')
let mockery

const windowsCollectorModule = '../../lib/password-collectors/windows-collector.js'

test.beforeEach(() => {
  mockery = require('mockery')
  mockery.enable({ useCleanCache: true })
  mockery.registerAllowable(windowsCollectorModule, true)
  mockery.warnOnUnregistered(false)
  mockery.registerAllowables(['../constants.js'])
})

test.afterEach(() => {
  mockery.deregisterAll()
  mockery.resetCache()
  mockery.disable()
})

test('debug mode should resolve without calling encrypt', (t) => {
  const Collector = require(windowsCollectorModule)
  const c = new Collector('debug')

  const encryptMock = {
    encrypt: (p) => {
      t.fail('encrypt should not be called.')
      return Promise.resolve(p)
    }
  }

  return t.notThrows(c.promptCallback(null, encryptMock))
})

test('release mode call encrypt', (t) => {
  t.plan(2)
  const expected = '1234'
  const input = {
    windows_password: 'encrypted string'
  }

  const encryptMock = {
    encrypt: (p) => {
      t.is(p, input.windows_password)
      return Promise.resolve(expected)
    }
  }

  const Collector = require(windowsCollectorModule)
  const c = new Collector('release')

  return c.promptCallback(input, encryptMock).then((result) => t.is(result, expected))
})
