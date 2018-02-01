'use strict'

// foreign modules

const updateNotifier = require('update-notifier')
const BlinkMobileIdentity = require('@blinkmobile/bm-identity')
// local modules

const pkg = require('./package.json')
const help = require('./lib/help')

// this module

const blinkMobileIdentity = new BlinkMobileIdentity(pkg.name)

const commands = {
  build: require('./commands/build.js'),
  evergreen: require('./commands/evergreen.js'),
  notify: require('./commands/notify.js')
}

updateNotifier({ pkg }).notify()

module.exports = function (input, flags) {
  const command = input[0]

  if (!command) {
    console.log(help)
    process.exit(0)
  }

  if (!commands[command]) {
    console.error(`unknown command: ${command}`)
    console.log(help)
    process.exit(1)
  }

  if (typeof commands[command] !== 'function') {
    console.log('not implemented')
    process.exit(1)
  }

  commands[command](input.slice(1), flags, {
    blinkMobileIdentity,
    cwd: process.cwd()
  })
}
