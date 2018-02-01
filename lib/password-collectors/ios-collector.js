'use strict'

const constants = require('../constants.js')

const privateVars = new WeakMap()

class IOSCollector {
  constructor (buildMode) {
    privateVars.set(this, {
      buildMode
    })
  }

  get PLATFORM () {
    return constants.PLATFORMS.IOS
  }

  get BUILD_MODE () {
    return privateVars.get(this).buildMode
  }

  get promptQuestions () {
    return [
      {
        type: 'password',
        name: 'ios_password',
        message: 'iOS Certificate Password: '
      }
    ]
  }

  promptCallback (result, encryptionProvider) {
    return encryptionProvider.encrypt(result.ios_password)
  }
}

module.exports = IOSCollector
