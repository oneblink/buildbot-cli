'use strict';

const path = require('path');

const test = require('ava');
const proxyquire = require('proxyquire');

const inquirerMock = require('./helpers/inquirer.js');

const TEST_SUBJECT = '../lib/evergreen.js';
const constants = require('../lib/constants.js');

const ZIP_PATH = 'valid zip path';
const TENANT_NAME = 'tenant name';
const PROJECT = 'valid project id';
const CREDENTIALS = 'valid credentials';

test.beforeEach((t) => {
  t.context.log = console.log;
  t.context.getTestSubject = (overrides) => {
    overrides = overrides || {};

    return proxyquire(TEST_SUBJECT, Object.assign({
      'lodash.memoize': (fn) => fn,
      'inquirer': inquirerMock((questions) => {
        return Promise.resolve({
          confirmation: true
        });
      }),
      '@blinkmobile/bm-identity': function BlinkMobileIdentity () {
        this.assumeAWSRole = () => Promise.resolve();
        this.getTenants = () => Promise.resolve({
          current: TENANT_NAME
        });
      },
      './s3-uploader-factory.js': () => Promise.resolve()
    }, overrides));
  };
});

test.afterEach(t => {
  console.log = t.context.log;
});

test('filterByExists', (t) => {
  const evergreen = require(TEST_SUBJECT);

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
  const evergreen = require(TEST_SUBJECT);

  return evergreen.findPlatforms(path.join(__dirname, 'fixtures'))
    .then((platforms) => {
      t.is(Array.isArray(platforms), true);
      t.is(platforms.length, 0);
    });
});

test('findPlatforms: android, ios', (t) => {
  const evergreen = require(TEST_SUBJECT);

  return evergreen.findPlatforms(path.join(__dirname, 'fixtures', 'evergreen'))
    .then((platforms) => {
      t.is(Array.isArray(platforms), true);
      t.deepEqual(platforms, ['android', 'ios']);
    });
});

test('assumeAWSRole() should resolve', (t) => {
  const evergreen = t.context.getTestSubject();

  return evergreen.assumeAWSRole();
});

test('getCurrentTenant() should resolve to current tenant', (t) => {
  const evergreen = t.context.getTestSubject();

  return evergreen.getCurrentTenant()
    .then((tenant) => t.is(tenant, TENANT_NAME));
});

test('getCurrentTenant() should reject if no current tenant is found', (t) => {
  const evergreen = t.context.getTestSubject({
    '@blinkmobile/bm-identity': function BlinkMobileIdentity () {
      this.getTenants = () => Promise.resolve();
    }
  });

  return evergreen.getCurrentTenant()
    .catch((error) => {
      t.deepEqual(error, new Error('Current tenant is not set, please use \'bm identity tenant\' command to set a tenant before continuing.'));
    });
});

test('upload() should resolve', (t) => {
  const evergreen = t.context.getTestSubject();

  return evergreen.upload(ZIP_PATH, TENANT_NAME, PROJECT, CREDENTIALS)
    .then((location) => {
      const fileName = path.basename(ZIP_PATH);
      t.is(location, `https://evergreen.blinkm.io/${TENANT_NAME}/${PROJECT}/${fileName}`);
    });
});

test('upload() should pass correct input to s3UploaderFactory()', (t) => {
  const evergreen = t.context.getTestSubject({
    './s3-uploader-factory.js': (bucket, key, file, credentials) => {
      t.is(bucket, constants.BUILDBOT.EVERGREEN_BUCKET_NAME);
      t.is(key, `${TENANT_NAME}/${PROJECT}/${path.basename(ZIP_PATH)}`);
      t.is(file, ZIP_PATH);
      t.is(credentials, CREDENTIALS);
      return Promise.resolve();
    }
  });

  return evergreen.upload(ZIP_PATH, TENANT_NAME, PROJECT, CREDENTIALS);
});

test('confirm() should resolve to true if no files are passed in', (t) => {
  const evergreen = t.context.getTestSubject();

  return evergreen.confirm()
    .then((confirmation) => t.is(confirmation, true));
});

test.serial('confirm() should log the correct number of times if input exceeds max', (t) => {
  const max = 5;
  // Should log to the console the same amount of times as the max,
  // plus 1 more for the initial message,
  // plus 1 more for the 'Plus x more...' message
  t.plan(max + 2);
  const evergreen = t.context.getTestSubject();
  console.log = function (content) {
    t.pass();
  };

  return evergreen.confirm('1,2,3,4,5,6,7,8,9'.split(','), max);
});

test.serial('confirm() should log the correct number of times if input does not exceed max', (t) => {
  const max = 9;
  // Should log to the console the same amount of times as the max,
  // plus 1 more for the initial message
  t.plan(max + 1);
  const evergreen = t.context.getTestSubject();
  console.log = function (content) {
    t.pass();
  };

  return evergreen.confirm('1,2,3,4,5,6,7,8,9'.split(','), max);
});

test.serial('confirm() should pass correct input to inquirer()', (t) => {
  const evergreen = t.context.getTestSubject({
    'inquirer': inquirerMock((questions) => {
      t.deepEqual(questions, [{
        type: 'confirm',
        name: 'confirmation',
        message: 'Would you like to continue: [Y]'
      }]);
      return Promise.resolve({confirmation: true});
    })
  });
  console.log = (content) => {};

  return evergreen.confirm(['test']);
});
