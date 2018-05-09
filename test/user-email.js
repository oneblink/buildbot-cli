'use strict'

const test = require('ava')
let mockery

const userEmailModule = '../lib/user-email.js'
const cfgHelperModule = './utils/config-helper.js'

test.beforeEach(() => {
  mockery = require('mockery')
  mockery.enable({ useCleanCache: true })
  mockery.registerAllowable(userEmailModule, true)
  mockery.warnOnUnregistered(false)
  mockery.registerAllowables(['inquirer', 'email-validator', '../constants.js'])
})

test.afterEach(() => {
  mockery.deregisterAll()
  mockery.resetCache()
  mockery.disable()
})

test('read() should reject if user email is not set in file', (t) => {
  const userConfigMock = {
    user: {
      read: () => Promise.resolve({email: ''})
    }
  }

  mockery.registerMock(cfgHelperModule, userConfigMock)
  const userEmail = require(userEmailModule)

  return t.throws(userEmail.read(), 'No Email in user config file')
})

test('write should reject if email is invalid', (t) => {
  const userConfigMock = {
    user: {}
  }

  mockery.registerMock(cfgHelperModule, userConfigMock)
  const userEmail = require(userEmailModule)

  return t.throws(userEmail.write('invalid-email'), 'Invalid Email address')
})

test('write should return the email address only', (t) => {
  const userConfigMock = {
    user: {
      write: (fn) => Promise.resolve(fn({}))
    }
  }
  const expected = 'simon@blinkmobile.com.au'

  mockery.registerMock(cfgHelperModule, userConfigMock)
  const userEmail = require(userEmailModule)
  return userEmail.write(expected).then((result) => t.deepEqual(result, expected))
})

test('unset should remove the email from user config', (t) => {
  const cfgWithEmail = {email: 'simon@blinkmobile.com.au'}
  const userConfigMock = {
    user: {
      write: (fn) => Promise.resolve(fn(cfgWithEmail))
    }
  }
  const expected = ''

  mockery.registerMock(cfgHelperModule, userConfigMock)
  const userEmail = require(userEmailModule)
  return userEmail.unset().then((result) => t.deepEqual(result.email, expected))
})

test('writeIfNotSet should not overwrite an existing email', (t) => {
  const expected = 'simon@blinkmobile.com.au'
  const userConfigMock = {
    user: {
      read: () => Promise.resolve({email: expected}),
      write: (fn) => Promise.reject(new Error('Should not of been called'))
    }
  }

  mockery.registerMock(cfgHelperModule, userConfigMock)
  const userEmail = require(userEmailModule)

  return t.notThrows(userEmail.writeIfNotSet('a@b.com'))
})

test('writeIfNotSet should not return an existing email', (t) => {
  const expected = 'simon@blinkmobile.com.au'
  const userConfigMock = {
    user: {
      read: () => Promise.resolve({email: 'a@b.com'}),
      write: (fn) => Promise.reject(new Error('Should not of been called'))
    }
  }

  mockery.registerMock(cfgHelperModule, userConfigMock)
  const userEmail = require(userEmailModule)

  return userEmail.writeIfNotSet(expected).then((result) => t.deepEqual(result, expected))
})
