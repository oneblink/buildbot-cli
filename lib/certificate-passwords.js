'use strict';

const inquirer = require('inquirer');

const EncryptionProvider = require('./encryption-provider.js');
const constants = require('./constants.js');
const collectors = new Map();
collectors.set(constants.PLATFORMS.WINDOWS, require('../lib/password-collectors/windows-collector.js'));
collectors.set(constants.PLATFORMS.ANDROID, require('../lib/password-collectors/android-collector.js'));
collectors.set(constants.PLATFORMS.IOS, require('../lib/password-collectors/ios-collector.js'));

const privateVars = new WeakMap();

class CertificatePasswords {
  constructor (platforms, buildMode, assumedRole) {
    privateVars.set(this, {
      platforms,
      buildMode,
      encryptionProvider: new EncryptionProvider(assumedRole),
      collectors: []
    });

    privateVars.get(this).collectors = this.prepCollectors();
  }

  prepCollectors () {
    const platforms = privateVars.get(this).platforms;
    const buildMode = privateVars.get(this).buildMode;

    return platforms.reduce((memo, platform) => {
      const Collector = collectors.get(platform.toLowerCase());
      if (Collector) {
        memo.push(new Collector(buildMode));
      }

      return memo;
    }, []);
  }

  get () {
    const collectors = privateVars.get(this).collectors;
    const encryptionProvider = privateVars.get(this).encryptionProvider;

    // Because Promise.all will run all functions in parallel,
    // need to get all questions and ask sequentially.
    const promptQuestions = collectors.reduce((memo, collector) => {
      (collector.promptQuestions || []).forEach(promptQuestion => memo.push(promptQuestion));
      return memo;
    }, []);

    // Ask all questions from each collector.
    return inquirer.prompt(promptQuestions).then(results => {
      // Create an array of functions to resolve for each collector and
      // transform the result of the prompts to passwords per collector
      return collectors.reduce((memo, collector) => {
        memo.push(() => collector.promptCallback(results, encryptionProvider).then(passwords => {
          return {
            platform: collector.PLATFORM,
            passwords: passwords
          };
        }));
        return memo;
      }, []);
    }).then(promiseFns => {
      return Promise.all(promiseFns.map(fn => fn())).then(results => {
        // Transform the result of each collector to a Map
        // for easy reading of the passwords per platform
        return results.reduce((memo, result) => {
          memo.set(result.platform, result.passwords);
          return memo;
        }, new Map());
      });
    });
  }
}

module.exports = CertificatePasswords;
