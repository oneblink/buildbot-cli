'use strict'

const cordovaConfig = require('./cordova-config.js')

function getProjectId (directory) {
  return new Promise((resolve, reject) => {
    // Get configuration
    cordovaConfig(directory, (error, config) => {
      if (!error && config && config.widget && config.widget.$ && config.widget.$.id) {
        resolve(config.widget.$.id)
      } else {
        // If project id does not exist, default to a randon string.
        reject(new Error('Could not find cordova project id. Please ensure the id attribute is set on the widget tag in config.xml'))
      }
    })
  })
}

module.exports = getProjectId
