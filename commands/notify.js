'use strict';

const isValidEmail = require('valid-email');

const userEmailSettings = require('../lib/user-email.js');

module.exports = function (input, flags, options) {
  const email = input[0];

  let result;

  if (!email) {
    // remove the global value
    if (flags.unset) {
      return userEmailSettings.unset();
    }

    result = userEmailSettings.askIfNotSet();
  } else {
    if (!isValidEmail(email)) {
      // we need a valid email to notify
      console.log(`Supplied email address "${email}" is not valid.`);
      result = userEmailSettings.ask();
    } else {
      result = Promise.resolve(email);
    }

    // store the valid email in user config.
    result.then((validEmail) => userEmailSettings.write(validEmail));
  }

  result.then((email) => console.log(`Notifications will be sent to: ${email}`));
};
