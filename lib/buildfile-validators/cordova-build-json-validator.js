'use strict';

const path = require('path');

const constants = require('../constants.js');

const privateVars = new WeakMap();
/**
 * Base class for validating a cordova build.json file.
 */
class CordovaBuildJSONValidator {
  constructor () {
    privateVars.set(this, {data: {}});
  }

  /**
   * a constant representing the platform data the validator works with
   */
  static get PLATFORM () {
    throw new Error('PLATFORM not implemented.');
  }

  /**
   * Get the list of supported modes to validate
   * @return {object} A immutable object containting the build modes
   */
  static get MODES () {
    return constants.BUILD_MODES;
  }

  /**
   * RELEASE mode constant
   * @returns {string} 'release'
   */
  static get RELEASE () {
    return constants.BUILD_MODES.RELEASE;
  }

  /**
   * DEBUG mode constant
   * @returns {string} 'debug'
   */
  static get DEBUG () {
    return constants.BUILD_MODES.DEBUG;
  }

  /**
   * the configuration data for each platform to be validated.
   * @return {Object} The contents of build.json
   * @throws {Error} If the child class has not set the PLATFORM static property
   */
  get data () {
    let cfg = privateVars.get(this).data[this.constructor.PLATFORM];
    if (!cfg) {
      privateVars.get(this).data[this.constructor.PLATFORM] = {};
      cfg = privateVars.get(this).data[this.constructor.PLATFORM];
    }

    return cfg;
  }

  /**
   * Sets data for the PLATFORM being validated. You can pass in a full
   * build.json file or just the config for the particular PLATFORM.
   * @param  {OBJECT} data build.json or just the relevant platform section
   */
  set data (data) {
    if (data[this.constructor.PLATFORM]) {
      privateVars.get(this).data[this.constructor.PLATFORM] = data[this.constructor.PLATFORM];
      return;
    }

    if (data[constants.BUILD_MODES.DEBUG] || data[constants.BUILD_MODES.RELEASE]) {
      privateVars.get(this).data[this.constructor.PLATFORM] = data;
    }
  }

  get path () {
    return privateVars.get(this).path;
  }

  set path (p) {
    const parsed = path.parse(p);
    privateVars.get(this).path = parsed.dir;
  }

  /**
   * Stub that must be impemented by child classes
   * @throws {Error} If the child class has not implemented this function.
   */
  isValid () {
    throw new Error('isValid method has not been implemented');
  }
}

module.exports = CordovaBuildJSONValidator;
