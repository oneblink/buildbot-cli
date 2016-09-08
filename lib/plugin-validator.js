'use strict';
const path = require('path');
const fs = require('fs');

const xml2js = require('xml2js');

const privateVars = new WeakMap();

/**
 * A class for confirming the installed plug ins are listed in config.xml
 */
class PluginValidator {
  constructor (projectPath) {
    privateVars.set(this, {
      projectPath,
      configFilePlugins: null,
      installedPlugins: null
    });
  }

  /**
   * The path to the project to validate
   * @return {string} The project path
   */
  get projectPath () {
    return privateVars.get(this).projectPath;
  }

  /**
   * A Map of the plugins listed in config.xml
   * @return {Map<string, string>} Key is the plugin name, value is the plugin spec
   */
  get configFilePlugins () {
    return privateVars.get(this).configFilePlugins;
  }

  /**
   * A list of the plugins installed in the cordova project
   * @return {Array<string>} Array of folder names found in projectPath/plugins
   */
  get installedPlugins () {
    return privateVars.get(this).installedPlugins;
  }

  /**
   * Reads projectPath/config.xml and gets the plugins that are listed
   * @return {Promise<Map<string, string>>} A Map of plugins, The keys are plugin names, Values are the plugin spec
   */
  readConfig () {
    return new Promise((resolve, reject) => {
      const cfgPath = path.join(this.projectPath, 'config.xml');
      fs.access(cfgPath, (err) => {
        if (err) {
          return reject(new Error('config.xml not found'));
        }

        fs.readFile(cfgPath, 'utf8', (err, xml) => {
          if (err) {
            return reject(new Error('Could not read config.xml'));
          }

          const parser = new xml2js.Parser();
          parser.parseString(xml, (err, result) => {
            if (err) {
              return reject(err);
            }

            privateVars.get(this).configFilePlugins = new Map((result.widget.plugin || []).map((el) => [el.$.name, el.$.spec]));
            resolve(this.configFilePlugins);
          });
        });
      });
    });
  }

  /**
   * Reads projectPath/plugins folder and returns the folder names of the plugins
   * @return {Promise<Array>} List of installed plugins
   */
  getInstalledPlugins () {
    return new Promise((resolve, reject) => {
      const pluginsFolder = path.join(this.projectPath, 'plugins');
      const installedPlugins = [];
      fs.readdir(pluginsFolder, (err, files) => {
        if (err) {
          privateVars.get(this).installedPlugins = installedPlugins;
          return resolve(privateVars.get(this).installedPlugins);
        }

        const finishAfter = (expectedCalls) => () => {
          if (--expectedCalls <= 0) {
            privateVars.get(this).installedPlugins = installedPlugins;
            resolve(installedPlugins);
          }
        };

        const finish = finishAfter(files.length);

        files.forEach((file) => {
          const fullPath = path.join(pluginsFolder, file);
          fs.stat(fullPath, (err, result) => {
            if (err) {
              finish();
              return;
            }

            if (result.isDirectory()) {
              installedPlugins.push(file);
            }

            finish();
          });
        });
      });
    });
  }

  /**
   * Gets the list of config.xml plugin entries and installed plugins from projectPath/plugins
   * and returns a list of plugins that are installed but not saved to config.xml
   * @return {Array<string>} A list of plugins that need to be saved to config.xml
   */
  crossReference () {
    return Promise.all([this.readConfig(), this.getInstalledPlugins()])
      .then((results) => {
        const configEntries = results[0];
        const installedPlugins = results[1];
        const missingFromConfig = installedPlugins.reduce((memo, pluginName) => {
          if (!configEntries.get(pluginName)) {
            memo.push(pluginName);
          }

          return memo;
        }, []);

        privateVars.get(this).missing = missingFromConfig;
        return missingFromConfig;
      });
  }
}

module.exports = PluginValidator;
