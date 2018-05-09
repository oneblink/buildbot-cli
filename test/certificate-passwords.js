'use strict'

const test = require('ava')
let mockery

const certificatePasswordsModule = '../lib/certificate-passwords.js'
const windowsCollectorModule = '../lib/password-collectors/windows-collector.js'
const encryptModule = require('../lib/encryption-provider.js')

test.beforeEach(() => {
  mockery = require('mockery')
  mockery.enable({ useCleanCache: true })
  mockery.registerAllowable(certificatePasswordsModule, true)
  mockery.warnOnUnregistered(false)
  mockery.registerAllowables([
    'inquirer',
    'email-validator',
    '../constants.js',
    encryptModule])
})

test.afterEach(() => {
  mockery.deregisterAll()
  mockery.resetCache()
  mockery.disable()
})

test('collectors should be instantiated with the correct build mode', (t) => {
  mockery.registerAllowable(windowsCollectorModule)
  const CP = require(certificatePasswordsModule)
  const expectedMode = 'debug'
  const cp = new CP(['windows'], expectedMode)
  const collectors = cp.prepCollectors()

  t.is(collectors.length, 1)
  t.is(collectors[0].BUILD_MODE, expectedMode)
})

test('unsupported platforms should not have a collector', (t) => {
  mockery.registerAllowable(windowsCollectorModule)
  const CP = require(certificatePasswordsModule)
  const expectedMode = 'debug'
  const cp = new CP(['windows', 'ios', 'android', 'test'], expectedMode)
  const collectors = cp.prepCollectors()

  t.is(collectors.length, 3)
  t.deepEqual(collectors.map((c) => c.PLATFORM), [
    'windows',
    'ios',
    'android'
  ])
})
