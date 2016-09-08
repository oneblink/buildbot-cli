'use strict';

const path = require('path');

const test = require('ava');
let mockery;

const pluginValidatorModule = '../lib/plugin-validator.js';

test.beforeEach(() => {
  mockery = require('mockery');
  mockery.enable({ useCleanCache: true });
  mockery.registerAllowable(pluginValidatorModule, true);
  mockery.warnOnUnregistered(false);
  mockery.registerAllowables(['']);
});

test.afterEach(() => {
  mockery.deregisterAll();
  mockery.resetCache();
  mockery.disable();
});

test.serial('readConfig() should reject if config.xml cannot be found', (t) => {
  const fsMock = {
    access: (p, cb) => cb(new Error('blah'))
  };

  mockery.registerMock('fs', fsMock);

  const PV = require(pluginValidatorModule);
  const pv = new PV(process.cwd());
  t.throws(pv.readConfig(), 'config.xml not found');
});

test.serial('readConfig() should reject if config.xml cannot be read', (t) => {
  const fsMock = {
    access: (p, cb) => cb(),
    readFile: (path, enc, cb) => cb(new Error('blah'))
  };

  mockery.registerMock('fs', fsMock);

  const PV = require(pluginValidatorModule);
  const pv = new PV(process.cwd());
  t.throws(pv.readConfig(), 'Could not read config.xml');
});

test.serial('readConfig() should return a map of plugins in config.xml', (t) => {
  const fs = require('fs');
  const fsMock = {
    access: (p, cb) => cb(),
    readFile: (path, enc, cb) => {
      fs.readFile('./fixtures/whitelist-only.config.xml', 'utf8', cb);
    }
  };

  mockery.registerMock('fs', fsMock);

  const PV = require(pluginValidatorModule);
  const pv = new PV(process.cwd());

  return pv.readConfig().then((plugins) => {
    t.deepEqual(plugins, pv.configFilePlugins);
    t.is(plugins.size, 1);
    t.true(plugins.has('cordova-plugin-whitelist'));
  });
});

test.serial('getInstalledPlugins() should return an array of plugins in the file system', (t) => {
  const PV = require(pluginValidatorModule);
  const pv = new PV(path.join(process.cwd(), 'fixtures'));

  return pv.getInstalledPlugins().then((plugins) => {
    t.is(plugins.length, 1);
    t.is(plugins[0], 'cordova-plugin-console');
  });
});

test.serial('crossReference() should return 1 plugin missing from config.xml', (t) => {
  const PV = require(pluginValidatorModule);
  const pv = new PV(path.join(process.cwd(), 'fixtures'));

  pv.readConfig = function () {
    const inConfig = new Map();
    inConfig.set('cordova-plugin-whitelist', '1.0.0');
    return Promise.resolve(inConfig);
  };

  pv.getInstalledPlugins = function () {
    return ['cordova-plugin-console', 'cordova-plugin-whitelist'];
  };

  return pv.crossReference().then((numMissing) => t.is(numMissing.length, 1));
});
