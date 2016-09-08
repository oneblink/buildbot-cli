'use strict';

const path = require('path');

const test = require('ava');
const mockery = require('mockery');

const validatorModule = '../lib/buildfile-validator.js';
const superModule = './lib/buildfile-validators/cordova-build-json-validator.js';

test.beforeEach(() => {
  mockery.enable({ useCleanCache: true });
  mockery.registerAllowable(validatorModule, true);
  mockery.warnOnUnregistered(false);
  mockery.registerAllowables([
    'path',
    superModule,
    './buildfile-validators/cordova-build-json-validator.js',
    './buildfile-validators/windows-validator.js',
    './cordova-build-json-validator.js',
    '../constants.js'], true);
});

test.afterEach(() => {
  mockery.deregisterAll();
  mockery.resetCache();
  mockery.disable();
});

test.serial('it should reject if the buildfile doesnt exist', (t) => {
  const fsMock = {
    access: (f, cb) => cb(false)
  };

  mockery.registerAllowable('i-dont-exist');
  mockery.registerMock('fs', fsMock);

  const v = require(validatorModule);
  t.throws(v('i-dont-exist'));
});

test.serial('it should resolve with platform string in any case', (t) => {
  const goodConfig = {
    windows: {debug: {packageCertificateKeyFile: 'a'}},
    android: {},
    ios: {}
  };
  const fsMock = {
    access: (f, cb) => {
      cb();
    }
  };
  const pathMock = {
    resolve: (cwd, b) => b,
    parse: path.parse.bind(path)
  };
  mockery.registerMock('path', pathMock);
  mockery.registerMock('fs', fsMock);
  mockery.registerMock('blah', goodConfig);

  const v = require(validatorModule);
  return v('blah', ['WInDows'], 'debug');
});

test.serial('it should reject because release mode is not present', (t) => {
  const goodConfig = {
    windows: {debug: {packageCertificateKeyFile: 'a'}},
    android: {},
    ios: {}
  };
  const fsMock = {
    access: (f, cb) => {
      cb();
    }
  };

  mockery.registerMock('fs', fsMock);
  mockery.registerMock('blah', goodConfig);

  const v = require(validatorModule);
  t.throws(v('blah', ['WInDows'], 'release'));
});

test.serial('it should reject with invalid config', (t) => {
  const badConfig = {
    windows: {'invalid': 'json'},
    android: {},
    ios: {}
  };
  const fsMock = {
    access: (f, cb) => {
      cb();
    }
  };

  mockery.registerMock('fs', fsMock);
  mockery.registerMock('blah', badConfig);

  const v = require(validatorModule);
  t.throws(v('blah', ['WInDows'], 'debug'));
});
