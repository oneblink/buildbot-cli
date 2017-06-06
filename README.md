# blinkmobile / buildbot-cli [![npm](https://img.shields.io/npm/v/@blinkmobile/buildbot-cli.svg?maxAge=2592000)](https://www.npmjs.com/package/@blinkmobile/buildbot-cli) [![AppVeyor Status](https://ci.appveyor.com/api/projects/status/github/blinkmobile/Buildbot-cli?branch=master&svg=true)](https://ci.appveyor.com/project/blinkmobile/buildbot-cli) [![Travis CI Status](https://travis-ci.org/blinkmobile/buildbot-cli.svg?branch=master)](https://travis-ci.org/blinkmobile/buildbot-cli) [![Greenkeeper badge](https://badges.greenkeeper.io/blinkmobile/buildbot-cli.svg)](https://greenkeeper.io/)

CLI to build hybrid apps with BlinkMobile.

## Installation

```
npm install -g @blinkmobile/cli @blinkmobile/identity-cli @blinkmobile/buildbot-cli
```

## Documentation

See the [Documentation](./docs/README.md) directory for more details.

## Usage

```sh
blinkm buildbot --help

# or, shorter
bm buildbot --help
```

```
Usage: blinkm buildbot <command>

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
    --platforms platforms       => comma separated list of platforms

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
  bm buildbot build --release
  bm buildbot build ./cordova-project --platforms android,ios,windows
  bm buildbot evergreen
  bm buildbot evergreen ./cordova-project --force
  bm buildbot notify
  bm buildbot notify your@email.com
```

#### Supported Platform

See [Supported Platforms](./docs/README.md#supported-platforms) of the Documentation for detailed usage information on each supported platform.
