# blinkmobile / buildbot-cli

## Submitting an App for Building

The `build` command requires users to be authenticated with a BlinkMobile Identity.
To login to the Buildbot CLI, see [identity-cli](https://github.com/blinkmobile/identity-cli)
for available commands.

Once you have been authenticated, you can submit your hybrid project for building
by using the `build` command.

`bm buildbot build` supports the following options:
- `<path-to-project-root>` optional, defaults to the current working directory
- `--notify your@email.address` optional, defaults to the address `notify` command, if unset, a prompt will ask for an address
- `--platforms android,ios,windows`
- `--release`
- `--debug`

To build a release version:
```sh
bm buildbot build [<path-to-project-root>] --platforms <comma-separated-list-of-platforms> [--buildMode release] --notify <your email>
```

To build a debug version:
```sh
bm buildbot build [<path-to-project-root>] --platforms <comma-separated-list-of-platforms> --buildMode debug --notify <your email>`
```
