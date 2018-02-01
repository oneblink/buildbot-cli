'use strict'

const fs = require('fs')
const path = require('path')
const constants = require('./constants.js')

const WindowsValidator = require('./buildfile-validators/windows-validator.js')
const AndroidValidator = require('./buildfile-validators/android-validator.js')
const IOSValidator = require('./buildfile-validators/ios-validator.js')

const validators = new Map()
validators.set(WindowsValidator.PLATFORM, WindowsValidator)
validators.set(AndroidValidator.PLATFORM, AndroidValidator)
validators.set(IOSValidator.PLATFORM, IOSValidator)

function load (buildJsonPath) {
  return new Promise((resolve, reject) => {
    fs.access(buildJsonPath, (err) => {
      if (err) {
        return reject(new Error(`${buildJsonPath} is required.`))
      }

      let buildJson

      try {
        buildJson = require(buildJsonPath)
        return resolve(buildJson)
      } catch (e) {
        reject(e)
      }
    })
  })
}

function prepValidators (platforms) {
  return platforms.reduce((memo, platform) => {
    const V = validators.get(platform.toLowerCase())
    if (V) {
      memo.push(new V())
    }
    return memo
  }, [])
}

/**
 * Validates a Cordova build.json path for the specified platforms and build mode
 * @param  {string} buildJsonPath the path to cordova's build.json file
 * @param  {Array<string>|string} platforms     An array of (or single) string(s) of platforms to build. Platform must be in a key in build.json
 * @param  {string} buildMode     debug or release mode. default is debug mode
 * @return {Promise}              A promise that resolves if all platforms and buildModes requested are valid, rejects if one of them fails validation.
 */
function validate (buildJsonPath, platforms, buildMode) {
  buildMode = buildMode || constants.BUILD_MODES.DEBUG
  if (!Array.isArray(platforms)) {
    platforms = [platforms]
  }

  buildJsonPath = path.resolve(process.cwd(), buildJsonPath)
  return load(buildJsonPath)
    .then((json) => {
      return Promise.all(prepValidators(platforms).map((v) => {
        v.data = json
        v.path = buildJsonPath
        return v.isValid(buildMode)
      }))
    })
}

module.exports = validate
