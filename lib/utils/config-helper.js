'use strict'

const pkg = require('../../package.json')
const configLoader = require('@blinkmobile/blinkmrc')

const projectConfig = configLoader.projectConfig({name: pkg.name})
const userConfig = configLoader.userConfig({name: pkg.name})

module.exports = {
  project: {
    read: () => projectConfig.load(),
    write: (updater) => projectConfig.update(updater)
  },
  user: {
    read: () => userConfig.load(),
    write: (updater) => userConfig.update(updater)
  }
}
