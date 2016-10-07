'use strict';

module.exports = `Blink Buildbot CLI

Usage: bm buildbot <command>

Where command is one of:

  build, evergreen, notify

Settings:

  notify your@email.com         => save the email address
  notify                        => show the saved email address
    --unset                     => remove the saved email address

Submitting project files to our build service:

  The build and evergreen commands require a login to BlinkMobile before use.
  For help on the login and logout commands please see:
  https://github.com/blinkmobile/identity-cli#usage

  build <project_path>          => submit files, notify via saved email
                                     omit <project_path> to use working dir
    --release                   => build the application in release mode
    --debug                     => build the application in debug mode (default)
    --notify your@email.com     => notify this email this time
    --platforms platforms       => comma seperated list of platforms

Evergreen update:

  The evergreen command also requires a tenant be set before use.
  For help on the setting a tenant please see:
  https://github.com/blinkmobile/identity-cli#manage-tenants

  evergreen <project_path>      => generate evergreen update ZIPs
                                     omit <project_path> to use working dir
    --force                     => overwrite existing files without confirmation
    --no-upload                 => prevent upload of ZIPs
    --type <evergreen_type>     => type of project (optional, defaults to 'cordova')

Examples
  bm buildbot build --buildMode release
  bm buildbot build ./cordova-project --platforms windows
  bm buildbot evergreen
  bm buildbot evergreen ./cordova-project --force
  bm buildbot notify
  bm buildbot notify your@email.com

`;
