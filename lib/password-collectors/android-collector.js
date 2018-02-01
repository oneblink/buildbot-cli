'use strict'

const constants = require('../constants.js')

const privateVars = new WeakMap()

class AndroidCollector {
  constructor (buildMode) {
    privateVars.set(this, {
      buildMode
    })
  }

  get PLATFORM () {
    return constants.PLATFORMS.ANDROID
  }

  get BUILD_MODE () {
    return privateVars.get(this).buildMode
  }

  get promptQuestions () {
    return privateVars.get(this).buildMode.toLowerCase() === constants.BUILD_MODES.DEBUG ? [] : [
      {
        type: 'password',
        name: 'android_keyStorePassword',
        message: 'Android Key Store Password: '
      },
      {
        type: 'password',
        name: 'android_keyPassword',
        message: 'Android Key Password: '
      }
    ]
  }

  promptCallback (result, encryptionProvider) {
    if (privateVars.get(this).buildMode.toLowerCase() === constants.BUILD_MODES.DEBUG) {
      return Promise.resolve()
    }

    return Promise.all([
      encryptionProvider.encrypt(result.android_keyStorePassword),
      encryptionProvider.encrypt(result.android_keyPassword)
    ]).then(notifiers => {
      return {
        keyStorePassword: notifiers[0],
        keyPassword: notifiers[1]
      }
    })
  }
}

module.exports = AndroidCollector
