# TODO

- On join, send back to server your git config (email and name)

- Save logs to files
- Test without username
- Save logs to files on production to proper folder (/var/log/delphis) with Windows and Mac support
- Multiple users support (different permissions for different users)
- Setup Bun Workspaces

- Exec command to run commands on the remote container, e.g. `delphis exec -- bun i dev`
- Improve the status command to discover and list available remote environments, showing host/device info for each. Use discovery logic similar to the join command, but without connecting/opening sessions.
