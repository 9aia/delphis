# Delphis

Secure remote development environments using Tailscale and VS Code Remote SSH protocol.

## Overview

Delphis enables seamless remote development across machines on your Tailscale network. Share your local environment or join a remote one with zero-config networking and end-to-end encryption.

Compatible with VS Code, Cursor, and any editor supporting the VS Code Remote SSH protocol.

## Prerequisites

- [Tailscale](https://tailscale.com) installed and running
- [Docker](https://www.docker.com) (for sharing environments)
- VS Code, Cursor, or compatible editor

## Quick Start

Install Delphis as a dev dependency in your project:

```bash
bun add -D delphis
# or any other package manager
```

You can use the `delphis` command directly in your project's terminal:

```bash
bunx delphis share
bunx delphis join
```

You can also add to your project's `package.json` scripts:

```json
{
  "scripts": {
    "dev:share": "delphis share",
    "dev:join": "delphis join"
  }
}
```

## Configuration

All configuration is optional via environment variables in your project's `.env` file:

```env
DELPHIS_LAUNCH_EDITOR=code  # or 'cursor'
DELPHIS_USERNAME=delphis
DELPHIS_PASSWORD=your_password
DELPHIS_PORT=22444
DELPHIS_FOLDER=/delphis
```

Defaults work out of the box without any configuration.

## Usage

### Share Your Environment

```bash
bunx delphis share
# or
npx delphis share
```

Starts a Docker container with SSH access to your current directory, discoverable on your Tailscale network.

### Join a Remote Environment

```bash
bunx delphis join
# or
npx delphis join
```

Discovers available remote environments on your Tailnet and opens your editor connected to the selected host.

Pass additional editor arguments:

```bash
bunx delphis join -- --new-window
```

### Stop Sharing

```bash
bunx delphis unshare
```

### Check Status

```bash
bunx delphis status
```

## How It Works

**Share**: Delphis runs a Docker container with SSH server, mounts your project directory, and makes it accessible via Tailscale's encrypted mesh network.

**Join**: Delphis discovers remote environments on your Tailnet using UDP broadcast, then launches your editor with the appropriate SSH connection.

**Security**: All traffic is encrypted through Tailscale's WireGuard-based VPN. No ports exposed to the public internet.

## Documentation

### Environment Variables

| Variable                | Default    | Description             |
| ----------------------- | ---------- | ----------------------- |
| `DELPHIS_LAUNCH_EDITOR` | `code`     | Editor binary to launch |
| `DELPHIS_USERNAME`      | `delphis`  | SSH username            |
| `DELPHIS_PASSWORD`      | -          | SSH password            |
| `DELPHIS_PORT`          | `22444`    | SSH port                |
| `DELPHIS_FOLDER`        | `/delphis` | Remote folder path      |

### Troubleshooting

**Tailscale not found**: Install from [tailscale.com](https://tailscale.com/download) and ensure it's in your PATH.

**Tailscale not running**: Run `tailscale up` to connect to your Tailnet.

**No environments discovered**: Ensure the remote machine is running `delphis share` and is on your Tailnet.

## FAQ

<details>
<summary>Is it secure?</summary>

While no software can claim 100% security, Delphis is designed with security in mind:
- All traffic is encrypted through Tailscale's WireGuard-based VPN
- No ports are exposed to the public internet
- Files are bind-mounted to the container with appropriate isolation
- The project is open source for transparency and community review

</details>

<details>
<summary>Which editors are supported?</summary>

Delphis works with any editor that supports the VS Code Remote SSH protocol, including:
- Visual Studio Code
- Cursor
- VSCodium
- Any editor with VS Code Remote SSH extension support

</details>

<details>
<summary>Can multiple people join the same environment?</summary>

Yes! Multiple developers can join the same shared environment simultaneously. Each will have their own editor instance connected to the same remote workspace, enabling real-time collaboration.

</details>

<details>
<summary>Why does it require Docker?</summary>

Docker provides a consistent, isolated environment for the SSH server and ensures clean setup/teardown. This approach:
- Avoids modifying your host system's SSH configuration
- Provides consistent behavior across different operating systems
- Makes cleanup simple (just stop the container)
- Isolates the development environment from your host

</details>

<details>
<summary>Why does it require Tailscale?</summary>

Tailscale provides a secure, encrypted network connection between your machines, ensuring all traffic is private and end-to-end encrypted. This approach:
- Avoids exposing your local machine's ports to the public internet
- Provides a secure, encrypted connection between your machines
- Ensures all traffic is private and end-to-end encrypted
- Isolates the development environment from your host

</details>

<details>
<summary>What happens to my files?</summary>

Your files remain on your local machine. Docker bind-mounts your project directory into the container, so:
- Changes made remotely are immediately reflected locally
- No file syncing or copying is involved
- When you stop sharing, the container is removed but your files are untouched

</details>

<details>
<summary>Do both machines need to run the same OS?</summary>

No! Delphis works across different operating systems. You can share from Linux and join from macOS, or any other combination, as long as both machines have the required prerequisites installed.

</details>

<details>
<summary>How is this different from VS Code's built-in Remote SSH?</summary>

Delphis builds on top of Remote SSH but adds:
- Zero-config discovery of available environments on your Tailnet
- Automatic Docker-based environment setup
- No manual SSH configuration needed
- Built-in Tailscale network integration
- Git co-authorship first-class support

</details>

<details>
<summary>What's the performance impact?</summary>

Performance is generally excellent due to:
- Tailscale's peer-to-peer connections (no relay server in most cases)
- WireGuard's minimal overhead
- Direct file access (bind mounts, not file syncing)
- The main factor is your network speed between machines

</details>

---

[License](LICENSE) | [Contributing](CONTRIBUTING.md)
