# Blink Buildbot CLI Tool [![npm](https://img.shields.io/npm/v/@blinkmobile/buildbot-cli.svg?maxAge=2592000)](https://www.npmjs.com/package/@blinkmobile/buildbot-cli) [![AppVeyor Status](https://ci.appveyor.com/api/projects/status/github/blinkmobile/Buildbot-cli?branch=master&svg=true)](https://ci.appveyor.com/project/blinkmobile/buildbot-cli) [![Travis CI Status](https://travis-ci.org/blinkmobile/buildbot-cli.svg?branch=master)](https://travis-ci.org/blinkmobile/buildbot-cli)

This tool is for starting the BlinkMobile Buildbot process.

## Installation

```
npm install -g @blinkmobile/cli @blinkmobile/identity-cli @blinkmobile/buildbot-cli
```

## Usage

`blinkm buildbot --help`

or, shorter

`bm buildbot --help`

### Submitting an app for building

The `build` command requires users to be authenicated with a BlinkMobile Identity.
To login to the Buildbot CLI, see [identity-cli](https://github.com/blinkmobile/identity-cli)
for available commands.

Once you have been authenicated, you can submit your hybrid project for building
by using the `build` command.

`bm buildbot build` supports the following options:
- `<path-to-project-root>` (optional, defaults to the current working directory)
- `--notify your@email.address` (optional, defaults to the address `notify` command, if unset, a prompt will ask for an address)
- `--platforms android,ios,windows`
- `--buildMode release|debug` (optional, defaults to 'debug')

To build a release version:
```sh
bm buildbot build [<path-to-project-root>] --platforms <comma-seperated-list-of-platforms> [--buildMode release] --notify <your email>
```

To build a debug version:
```sh
bm buildbot build [<path-to-project-root>] --platforms <comma-seperated-list-of-platforms> --buildMode debug --notify <your email>`
```

### Notifications

To be notified of the result you can supply the email address via the `--notify` flag for the `build` command, or you can store the email in the user specific `blinkmrc.json` file using the `notify` command.

`bm buildbot notify` will show the currently stored email address
- `your@email.address` will store the email address
- `--unset` will remove the stored email address

Running the build command with the `--notify` flag will take precedence over the stored email address.

To display the email address to be notified:
```sh
bm buildbot notify
```

To set the email address to be notified:
```sh
bm buildbot notify your@email.address
```

### Evergreen Updates

iOS and Android applications allow for evergreen updates. This option will allow for resouces to be zipped into a folder per platform 

`bm buildbot evergreen` supports the following options:
- `--force` (optional, overwrite any existing update ZIPs)

To zip resources for a project:  
```sh
bm buildbot evergreen <path-to-project-root> [--force]
```

See the `./docs` folder for detailed usage information on each supported platform.
