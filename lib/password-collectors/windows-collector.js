'use strict';

const constants = require('../constants.js');

const privateVars = new WeakMap();

class WindowsCollector {
  constructor (buildMode) {
    privateVars.set(this, {
      buildMode
    });
  }

  get PLATFORM () {
    return constants.PLATFORMS.WINDOWS;
  }

  get BUILD_MODE () {
    return privateVars.get(this).buildMode;
  }

  get promptQuestions () {
    return privateVars.get(this).buildMode.toLowerCase() === constants.BUILD_MODES.DEBUG ? [] : [
      {
        type: 'password',
        name: 'windows_password',
        message: 'Windows Certificate Password: '
      }
    ];
  }

  promptCallback (result, encryptionProvider) {
    if (privateVars.get(this).buildMode.toLowerCase() === constants.BUILD_MODES.DEBUG) {
      return Promise.resolve();
    }

    return encryptionProvider.encrypt(result.windows_password);
  }
}

module.exports = WindowsCollector;
