'use strict'

const inquirer = require('inquirer')
const isValidEmail = require('email-validator').validate

const userConfig = require('./utils/config-helper.js').user

const read = () => userConfig.read().then((cfg) => {
  if (!cfg.email) {
    return Promise.reject(new Error('No Email in user config file'))
  }

  return cfg.email
})

const write = (email) => {
  if (!isValidEmail(email)) {
    return Promise.reject(new Error('Invalid Email address'))
  }

  return userConfig.write((cfg) => {
    cfg.email = email

    return cfg
  }).then((cfg) => cfg.email)
}

const unset = () => userConfig.write((cfg) => {
  if (cfg.email) {
    console.log(`Removing ${cfg.email} from CLI settings`)
  }
  cfg.email = ''

  return cfg
})

const askForEmailQuestion = (currentEmail) => {
  return {
    type: 'input',
    name: 'notifyEmail',
    message: 'Email Address to notify: ',
    default: currentEmail,
    validate: (email) => isValidEmail(email) ? true : `${email} is invalid`
  }
}

const ask = (currentEmail) => inquirer.prompt([askForEmailQuestion(currentEmail)]).then((answer) => answer.notifyEmail)

const askIfNotSet = () => read().catch(() => {
  console.log('Notification email address has not yet been set.')
  return ask()
}).then((email) => write(email))

const writeIfNotSet = (email) => read().catch(() => write(email)).then(() => email)

module.exports = {read, write, unset, ask, askIfNotSet, writeIfNotSet}
