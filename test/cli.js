'use strict';

const path = require('path');

const fs = require('@jokeyrhyme/pify-fs');
const test = require('ava');
const execa = require('execa');

const CLI_PATH = path.join(__dirname, '..', 'bin', 'index.js');

test('bin/index.js is executable', (t) => fs.access(CLI_PATH, fs.X_OK));

test('bin/index.js has no CRLF', (t) => {
  return fs.readFile(CLI_PATH, 'utf8')
    .then((data) => t.is(data.indexOf('\r\n'), -1));
});

test('bin/index.js --help', (t) => {
  return execa('node', [ CLI_PATH, '--help' ])
    .then(({ stdout }) => t.truthy(stdout));
});

test('bin/index.js --version', (t) => {
  return execa('node', [ CLI_PATH, '--version' ])
    .then(({ stdout }) => t.truthy(stdout));
});
