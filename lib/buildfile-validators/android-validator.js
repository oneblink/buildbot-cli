'use strict'

const fs = require('fs')
const path = require('path')

const constants = require('../constants.js')
const JSONValidator = require('./cordova-build-json-validator.js')

const privateVars = new WeakMap()

/**
 * Validates a Cordova build.json file for android.
 */
class AndroidBuildFileValidator extends JSONValidator {
  constructor () {
    super(arguments)
    const requiredKeys = new Map()
    requiredKeys.set(constants.BUILD_MODES.DEBUG, [])
    requiredKeys.set(constants.BUILD_MODES.RELEASE, ['keystore', 'alias'])
    privateVars.set(this, {requiredKeys})
  }

  /**
   * a constant representing the platform data the validator works with
   *
   * @returns {string} 'android'
   */
  static get PLATFORM () {
    return constants.PLATFORMS.ANDROID
  }

  /**
   * Validates the build file according to the build mode
   * @param  {string}  buildMode AndroidBuildFileValidator.RELEASE or AndroidBuildFileValidator.DEBUG
   * @return {Promise}           Resolves with the configuration or rejects with the reason why its invalid.
   */
  isValid (buildMode) {
    const missingKeys = this.getMissingKeys(buildMode)
    if (missingKeys.length) {
      return Promise.reject(new Error(`The following keys are missing from ${path.join(this.path, 'build.json')}: ${missingKeys.join(', ')}`))
    }

    return this.doesKeyStoreFileExist(buildMode)
  }

  /**
   * Returns a list of keys or buildModes that are missing from the config.
   * @param  {string} buildMode  AndroidBuildFileValidator.RELEASE or AndroidBuildFileValidator.DEBUG
   * @return {Array<string>}     A list of keys that are missing from the config.
   */
  getMissingKeys (buildMode) {
    const requiredKeys = privateVars.get(this).requiredKeys.get(buildMode)

    if (!requiredKeys || !requiredKeys.length) {
      return []
    }

    if (!this.data[buildMode]) {
      return [buildMode]
    }

    const actualKeys = Object.keys(this.data[buildMode])
    return requiredKeys.filter((key) => actualKeys.indexOf(key) === -1)
  }

  /**
   * Checks for the existance of the Key Store File specified in the [buildMode]
   * section of build.json
   * @param  {string} buildMode AndroidBuildFileValidator.RELEASE or AndroidBuildFileValidator.DEBUG
   * @return {Promise<string>} Promise that will reject if the file does not exist, or
   * resolve with the path to the file.
   */
  doesKeyStoreFileExist (buildMode) {
    if (buildMode.toLowerCase() === constants.BUILD_MODES.DEBUG) {
      return Promise.resolve()
    }

    if (!this.data[buildMode]) {
      return Promise.reject(new Error(`Requested build mode not in ${path.join(this.path, 'build.json')}`))
    }

    return new Promise((resolve, reject) => {
      const keyStoreFilePath = path.resolve(process.cwd(), this.path, this.data[buildMode].keystore)

      fs.access(keyStoreFilePath, (err) => {
        if (err) {
          return reject(new Error(`${this.path} specifies an invalid path to keystore (${this.data[buildMode].keystore}). Please use a relative path to the file.`))
        }
        resolve(this.data[buildMode].keystore)
      })
    })
  }
}

module.exports = AndroidBuildFileValidator
