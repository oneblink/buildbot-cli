'use strict'

const execa = require('execa')

const inquirer = require('inquirer')

/**
 * Handles the installation of missing plugins
 */
class PluginInstaller {
  constructor (projectPath) {
    this.projectPath = projectPath
    this.failed = new Map()
    this.skipped = []
  }

  /**
   * Show the user the list of missing plugins, prompt for which ones to install, then attempts to install
   * the selected plugins and save
   * @param  {Array<string>} missingPlugins The plugin names that are missing from config.xml
   * @return {Promise<Number>}                Resolves with the number of plugins still missing from config.xml
   */
  install (missingPlugins) {
    if (missingPlugins.length === 0) {
      return Promise.resolve(0)
    }

    return this.promptForList(missingPlugins)
      .then((selected) => Promise.all(selected.map((pluginName) => this.installPlugin(pluginName))))
      .then(() => this.showResults())
      .then(() => this.failed.size + this.skipped.length)
      .catch((err) => console.log(err))
  }

  /**
   * Attempt to install pluginName and save it to config.xml via `cordova plugin add --save`
   *
   * Any failed installed are saved in this.failed
   * @param  {string} pluginName Name of the plugin to install
   * @return {Promise<string>}            Resolves with the plugin name if successful, error message if unsuccessful
   */
  installPlugin (pluginName) {
    return new Promise((resolve, reject) => {
      console.log(`Attempting to install ${pluginName}`)
      const cmd = `cordova plugin add ${pluginName} --save`
      try {
        const cordova = execa.shell(cmd, {cwd: this.projectPath})

        cordova.on('exit', (code) => {
          resolve(pluginName)
        })

        cordova.on('error', (err) => {
          resolve(new Error(err.toString('utf8')))
        })

        cordova.stderr.on('data', (err) => {
          let error = err.toString('utf8')
          const currentError = this.failed.get(pluginName)
          if (currentError) {
            error = currentError + error
          }
          this.failed.set(pluginName, error.trim())
          resolve(new Error(err.toString('utf8')))
        })
      } catch (e) {
        reject(e)
      }
    })
  }

  /**
   * Shows a prompt asking the user to confirm which plugins are installed
   *
   * Any plugins that were not selected are stored in this.skipped
   * Any plugins that were selected are stored in this.selected
   * @param  {Array<string>} missingPlugins Plugin names that are to be confirmed
   * @return {Promise<Array<string>>}                Resolves with the user selected plugins to install
   */
  promptForList (missingPlugins) {
    const promptOptions = {
      type: 'checkbox',
      message: 'Select plugins that came from the Cordova registry',
      name: 'plugins',
      choices: missingPlugins
    }

    console.log(`Plugins that were installed from the Cordova registry can be automatically
added to config.json. If you are unsure of the origin of the plugin, do not
select it.

`)

    return inquirer.prompt(promptOptions).then((results) => {
      this.selected = results.plugins
      this.skipped = missingPlugins.filter((p) => this.selected.indexOf(p) === -1)
      return this.selected
    })
  }

  /**
   * Shows a list of failed installs and skipped plugins
   */
  showResults () {
    if (this.failed.size) {
      this.failed.forEach((message, pluginName) => console.log(`Installation of "${pluginName}" failed:

${message}

      `))
    }

    if (this.skipped.length) {
      console.log(`The following plugins were skipped and need to be manually added to
config.xml:

${this.skipped.join(', ')}`)
    }
  }
}

module.exports = PluginInstaller
