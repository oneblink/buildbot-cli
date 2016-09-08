'use strict';

const test = require('ava');
const mockery = require('mockery');

const validatorModule = '../../lib/buildfile-validators/cordova-build-json-validator.js';

test.beforeEach(() => {
  mockery.enable({ useCleanCache: true });
  mockery.registerAllowable(validatorModule, true);
  mockery.registerAllowables(['path', '../constants.js']);
});

test.afterEach(() => {
  mockery.deregisterAll();
  mockery.resetCache();
  mockery.disable();
});

test('it should have 3 working static properties', (t) => {
  const Validator = require(validatorModule);
  t.deepEqual(Validator.MODES, {RELEASE: 'release', DEBUG: 'debug'});
  t.is(Validator.RELEASE, 'release');
  t.is(Validator.DEBUG, 'debug');
});

test('it should throw when the PLATFORM static property is accessed', (t) => {
  const Validator = require(validatorModule);
  t.throws(() => Validator.PLATFORM);
});

test('data getter should throw because no PLATFORM is set', (t) => {
  const Validator = require(validatorModule);
  const v = new Validator();

  t.throws(() => v.data);
});

test('Validator#isValid should throw ', (t) => {
  const Validator = require(validatorModule);
  const v = new Validator();
  t.throws(v.isValid);
});

test('path setter should set the path to the cordova project', (t) => {
  const Validator = require(validatorModule);
  const v = new Validator();
  v.path = './package.json';
  t.is(v.path, '.');
});
