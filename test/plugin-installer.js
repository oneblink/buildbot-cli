'use strict';

const test = require('ava');

const pluginInstallerModule = '../lib/plugin-installer.js';
let mockery;

test.beforeEach(() => {
  mockery = require('mockery');
  mockery.enable({ useCleanCache: true });
  mockery.registerAllowable(pluginInstallerModule, true);
  mockery.registerAllowables(['execa', 'mockery', 'module']);
  mockery.warnOnUnregistered(false);
  console.log = function () {}; // supress log outputs.
});

test.afterEach(() => {
  mockery.deregisterAll();
  mockery.resetCache();
  mockery.disable();
});

test('promptForList() should set the selected and skipped plugins and resolve with the plugin names to install', (t) => {
  const inquirerMock = {
    prompt: (opts) => Promise.resolve({plugins: [opts.choices[0]]})
  };

  mockery.registerMock('inquirer', inquirerMock);

  const PI = require(pluginInstallerModule);
  const pi = new PI();
  const input = ['plugin1', 'plugin2', 'plugin3'];
  const expectedSkipped = input.slice(1);
  return pi.promptForList(input).then((selected) => {
    t.is(selected.length, 1);
    t.is(selected[0], 'plugin1');
    t.deepEqual(pi.skipped, expectedSkipped);
  });
});

test('promptForList() should handle 0 selected items correctly', (t) => {
  const inquirerMock = {
    prompt: (opts) => Promise.resolve({plugins: []})
  };

  mockery.registerMock('inquirer', inquirerMock);

  const PI = require(pluginInstallerModule);
  const pi = new PI();
  const input = ['plugin1', 'plugin2', 'plugin3'];
  const expectedSkipped = input;
  return pi.promptForList(input).then((selected) => {
    t.is(selected.length, 0);
    t.deepEqual(pi.skipped, expectedSkipped);
  });
});

test('install() should resolve with the correct number of missing plugins', (t) => {
  const inquirerMock = {
    prompt: (opts) => Promise.resolve({plugins: opts.choices.slice(0, 2)})
  };

  mockery.registerMock('inquirer', inquirerMock);

  const PI = require(pluginInstallerModule);
  const pi = new PI();
  const input = ['plugin1', 'plugin2', 'plugin3'];
  const expectedNumMissing = 2;

  pi.installPlugin = function (pluginName) {
    if (pluginName === 'plugin1') {
      this.failed.set(pluginName, 'simulated fail');
    }

    return Promise.resolve(pluginName);
  };

  pi.install(input).then((numMissing) => {
    t.is(numMissing, expectedNumMissing);
  });
});
