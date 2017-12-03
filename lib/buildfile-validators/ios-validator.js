'use strict';

const fs = require('fs');
const path = require('path');
const uuidValidate = require('uuid-validate');

const constants = require('../constants.js');
const JSONValidator = require('./cordova-build-json-validator.js');

const privateVars = new WeakMap();

/**
 * Validates a Cordova build.json file for iOS.
 */
class IOSBuildFileValidator extends JSONValidator {
  constructor () {
    super(arguments);
    const requiredKeys = new Map();
    const fileNames = [
      'codeSignIdentity',
      'provisioningProfile',
      'provisioningProfileFile',
      'certificateFile'
    ];
    requiredKeys.set(constants.BUILD_MODES.DEBUG, fileNames);
    requiredKeys.set(constants.BUILD_MODES.RELEASE, fileNames);
    privateVars.set(this, {requiredKeys});
  }

  /**
   * a constant representing the platform data the validator works with
   *
   * @returns {string} 'ios'
   */
  static get PLATFORM () {
    return constants.PLATFORMS.IOS;
  }

  /**
   * Validates the build file according to the build mode
   * @param  {string}  buildMode IOSBuildFileValidator.RELEASE or IOSBuildFileValidator.DEBUG
   * @return {Promise}           Resolves with the configuration or rejects with the reason why its invalid.
   */
  isValid (buildMode) {
    const missingKeys = this.getMissingKeys(buildMode);
    if (missingKeys.length) {
      return Promise.reject(new Error(`The following keys are missing from ${path.join(this.path, 'build.json')}: ${missingKeys.join(', ')}`));
    }

    // Validate uuid for provisioning profile.
    if (!uuidValidate(this.data[buildMode].provisioningProfile)) {
      return Promise.reject(new Error(`'provisioningProfile' property in ${path.join(this.path, 'build.json')} is not a valid UUID: '${this.data[buildMode].provisioningProfile}'`));
    }

    // Ensure provisioning profile and certificate files exist
    return Promise.all([
      this.doesFileExist(buildMode, 'provisioningProfileFile'),
      this.doesFileExist(buildMode, 'certificateFile')
    ]);
  }

  /**
   * Returns a list of keys or buildModes that are missing from the config.
   * @param  {string} buildMode  IOSBuildFileValidator.RELEASE or IOSBuildFileValidator.DEBUG
   * @return {Array<string>}     A list of keys that are missing from the config.
   */
  getMissingKeys (buildMode) {
    const requiredKeys = privateVars.get(this).requiredKeys.get(buildMode);

    if (!requiredKeys || !requiredKeys.length) {
      return [];
    }

    if (!this.data[buildMode]) {
      return [buildMode];
    }

    const actualKeys = Object.keys(this.data[buildMode]);
    return requiredKeys.filter((key) => actualKeys.indexOf(key) === -1);
  }

  /**
   * Checks for the existence of a file specified in the [buildMode]
   * section of build.json
   * @param  {string} buildMode IOSBuildFileValidator.RELEASE or IOSBuildFileValidator.DEBUG
   * @return {Promise<string>} Promise that will reject if the file does not exist, or
   * resolve with the path to the file.
   */
  doesFileExist (buildMode, fileName) {
    if (!this.data[buildMode]) {
      return Promise.reject(new Error(`Requested build mode not in ${path.join(this.path, 'build.json')}`));
    }

    return new Promise((resolve, reject) => {
      const filePath = path.resolve(process.cwd(), this.path, this.data[buildMode][fileName]);

      fs.access(filePath, (err) => {
        if (err) {
          return reject(new Error(`${this.path} specifies an invalid path (${this.data[buildMode][fileName]}). Please use a relative path to the file.`));
        }
        resolve(this.data[buildMode][fileName]);
      });
    });
  }
}

module.exports = IOSBuildFileValidator;
