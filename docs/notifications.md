# blinkmobile / buildbot-cli

## Notifications

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
