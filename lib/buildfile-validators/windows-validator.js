'use strict'

const fs = require('fs')
const path = require('path')

const constants = require('../constants.js')
const JSONValidator = require('./cordova-build-json-validator.js')

const privateVars = new WeakMap()

/**
 * Validates a Cordova build.json file for windows.
 */
class WindowsBuildFileValidator extends JSONValidator {
  constructor () {
    super(arguments)
    const requiredKeys = new Map()
    requiredKeys.set(constants.BUILD_MODES.DEBUG, ['packageCertificateKeyFile'])
    requiredKeys.set(constants.BUILD_MODES.RELEASE, ['packageCertificateKeyFile', 'packageThumbprint', 'publisherId'])
    privateVars.set(this, {requiredKeys})
  }

  /**
   * a constant representing the platform data the validator works with
   *
   * @returns {string} 'windows'
   */
  static get PLATFORM () {
    return constants.PLATFORMS.WINDOWS
  }

  /**
   * Validates the build file according to the build mode
   * @param  {string}  buildMode WindowsBuildFileValidator.RELEASE or WindowsBuildFileValidator.DEBUG
   * @return {Promise}           Resolves with the configuration or rejects with the reason why its invalid.
   */
  isValid (buildMode) {
    const missingKeys = this.getMissingKeys(buildMode)
    if (missingKeys.length) {
      return Promise.reject(new Error(`The following keys are missing from ${path.join(this.path, 'build.json')}: ${missingKeys.join(', ')}`))
    }

    return this.doesKeyfileExist(buildMode)
  }

  /**
   * Returns a list of keys or buildModes that are missing from the config.
   * @param  {string} buildMode  WindowsBuildFileValidator.RELEASE or WindowsBuildFileValidator.DEBUG
   * @return {Array<string>}     A list of keys that are missing from the config.
   */
  getMissingKeys (buildMode) {
    if (!this.data[buildMode]) {
      return [buildMode]
    }

    const requiredKeys = privateVars.get(this).requiredKeys.get(buildMode)
    const actualKeys = Object.keys(this.data[buildMode])
    return requiredKeys.filter((key) => actualKeys.indexOf(key) === -1)
  }

  /**
   * Checks for the existence of the Certificate File specified in the [buildMode]
   * section of build.json
   * @param  {string} buildMode WindowsBuildFileValidator.RELEASE or WindowsBuildFileValidator.DEBUG
   * @return {Promise<string>} Promise that will reject if the file does not exist, or
   * resolve with the path to the file.
   */
  doesKeyfileExist (buildMode) {
    if (!this.data[buildMode]) {
      return Promise.reject(new Error(`Requested build mode not in ${path.join(this.path, 'build.json')}`))
    }

    if (buildMode.toLowerCase() === constants.BUILD_MODES.DEBUG) {
      return Promise.resolve(this.data[buildMode].packageCertificateKeyFile)
    }

    return new Promise((resolve, reject) => {
      const keyFilePath = path.resolve(process.cwd(), this.path, this.data[buildMode].packageCertificateKeyFile)

      fs.access(keyFilePath, (err) => {
        if (err) {
          return reject(new Error(`${this.path} specifies an invalid path to packageCertificateKeyFile (${this.data[buildMode].packageCertificateKeyFile}). Please use a relative path to the file.`))
        }
        resolve(this.data[buildMode].packageCertificateKeyFile)
      })
    })
  }
}

module.exports = WindowsBuildFileValidator
