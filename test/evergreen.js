'use strict';

const path = require('path');

const test = require('ava');

const evergreen = require('../lib/evergreen.js');

test('filterByExists', (t) => {
  const expected = [
    path.join(__dirname, 'fixtures', 'evergreen', 'platforms')
  ];
  const input = [
    ...expected,
    path.join(__dirname, 'fixtures', 'evergreen', 'plugins')
  ];
  return evergreen.filterByExists(input)
    .then((existingPaths) => {
      t.is(Array.isArray(existingPaths), true);
      t.deepEqual(existingPaths, expected);
    });
});

test('findPlatforms: none', (t) => {
  return evergreen.findPlatforms(path.join(__dirname, 'fixtures'))
    .then((platforms) => {
      t.is(Array.isArray(platforms), true);
      t.is(platforms.length, 0);
    });
});

test('findPlatforms: android, ios', (t) => {
  return evergreen.findPlatforms(path.join(__dirname, 'fixtures', 'evergreen'))
    .then((platforms) => {
      t.is(Array.isArray(platforms), true);
      t.deepEqual(platforms, ['android', 'ios']);
    });
});
