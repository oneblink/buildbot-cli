# blinkmobile / buildbot-cli

## Evergreen Updates

iOS and Android applications allow for evergreen updates. This option will allow for resources to be zipped into a folder per platform

The `evergreen` command will also upload your zip files to a remote location to allow your applications to download them.
Uploading your zip files requires users to be authenticated with a BlinkMobile Identity.
To login to the Buildbot CLI, see [identity-cli](https://github.com/blinkmobile/identity-cli)
for available commands.

`bm buildbot evergreen` supports the following options:
- `--force` optional, overwrite any existing update zip files, use this flag to prevent a confirmation prompt when zip files already exist
- `--no-upload` optional, prevent the evergreen zip files from being uploaded to remote location

To zip resources for a project and upload:
```sh
bm buildbot evergreen <path-to-project-root> [--force]
```
