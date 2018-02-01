'use strict'

const PluginValidator = require('./plugin-validator.js')
const PluginInstaller = require('./plugin-installer.js')

module.exports = (projectFolder) => {
  console.log('Checking plugins')
  const pv = new PluginValidator(projectFolder)
  const pi = new PluginInstaller(projectFolder)
  return pv.crossReference().then((missingFiles) => pi.install(missingFiles)).then((numMissingPPlugins) => {
    if (numMissingPPlugins !== 0) {
      console.log('Buildbot cannot continue until all plugins are registered in config.xml')
      process.exit(1)
    }
  })
}
