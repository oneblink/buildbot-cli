'use strict'

const path = require('path')

const npmBinTester = require('npm-bin-ava-tester')
const test = require('ava')
const execa = require('execa')

npmBinTester(test)

const CLI_PATH = path.join(__dirname, '..', 'bin', 'index.js')

test('bin/index.js --help', (t) => {
  return execa('node', [ CLI_PATH, '--help' ])
    .then(({ stdout }) => t.truthy(stdout))
})

test('bin/index.js --version', (t) => {
  return execa('node', [ CLI_PATH, '--version' ])
    .then(({ stdout }) => t.truthy(stdout))
})
