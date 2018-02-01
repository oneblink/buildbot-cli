'use strict'

const test = require('ava')
const mockery = require('mockery')

const validatorModule = '../../lib/buildfile-validators/windows-validator.js'

mockery.registerMock('fs', {})
mockery.registerAllowable('../constants.js')
test('it should have 4 static properties', (t) => {
  const Validator = require(validatorModule)
  t.deepEqual(Validator.MODES, {RELEASE: 'release', DEBUG: 'debug'})
  t.deepEqual(Validator.RELEASE, 'release')
  t.deepEqual(Validator.DEBUG, 'debug')
  t.deepEqual(Validator.PLATFORM, 'windows')
})

test('it should set the windows configuration in this.data', (t) => {
  const goodConfig = {
    windows: {debug: {packageCertificateKeyFile: 'a'}},
    android: {},
    ios: {}
  }

  const Validator = require(validatorModule)
  const v = new Validator()
  v.data = goodConfig
  t.deepEqual(v.data, goodConfig.windows)
})

test('it should set windows configuration if config contains "release" or "debug" keys', (t) => {
  const goodConfig = {debug: {packageCertificateKeyFile: 'a'}}
  const Validator = require(validatorModule)
  const v = new Validator()
  v.data = goodConfig
  t.deepEqual(v.data, goodConfig)
})

test('it should not set the configuration in this.data', (t) => {
  const badConfig = {
    android: {debug: {}},
    ios: {debug: {}}
  }

  const Validator = require(validatorModule)
  const v = new Validator()
  v.data = badConfig
  t.deepEqual(v.data, {})
})

test('getMissingKeys should find missing keys', (t) => {
  const buildConfig = {
    debug: {},
    release: {
      packageCertificateKeyFile: 'a'
    }
  }

  const Validator = require(validatorModule)
  const v = new Validator()

  v.data = buildConfig
  let missingKeys = v.getMissingKeys(Validator.RELEASE)
  t.is(missingKeys.length, 2)
  t.true(missingKeys.indexOf('packageThumbprint') > -1)
  t.true(missingKeys.indexOf('publisherId') > -1)

  missingKeys = v.getMissingKeys(Validator.DEBUG)
  t.is(missingKeys.length, 1)
  t.true(missingKeys.indexOf('packageCertificateKeyFile') > -1)
})

test('getMissingKeys should find 0 missing keys', (t) => {
  const buildConfig = {
    debug: {
      packageCertificateKeyFile: 'a'
    },
    release: {
      packageCertificateKeyFile: 'a',
      packageThumbprint: 'b',
      publisherId: 'c'
    }
  }

  const Validator = require(validatorModule)
  const v = new Validator()

  v.data = buildConfig
  let missingKeys = v.getMissingKeys(Validator.RELEASE)
  t.is(missingKeys.length, 0)
  missingKeys = v.getMissingKeys(Validator.DEBUG)
  t.is(missingKeys.length, 0)
})

test('getMissingKeys should bail early if the build mode is not in build.json', (t) => {
  const buildConfig = {
    release: {
      packageCertificateKeyFile: 'a',
      packageThumbprint: 'b',
      publisherId: 'c'
    }
  }

  const Validator = require(validatorModule)
  const v = new Validator()

  v.data = buildConfig
  let missingKeys = v.getMissingKeys(Validator.DEBUG)
  t.is(missingKeys[0], Validator.DEBUG)
})
