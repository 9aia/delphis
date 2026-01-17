# Delphis

Secure remote development environments using Tailscale and VS Code Remote SSH protocol.

## Overview

Delphis enables seamless remote development across machines on your Tailscale network. Share your local environment or join a remote one with zero-config networking and end-to-end encryption.

Compatible with VS Code, Cursor, and any editor supporting the VS Code Remote SSH protocol.

## Prerequisites

- [Bun](https://bun.sh) or Node.js runtime
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

| Variable                | Default    | Description            |
| ----------------------- | ---------- | ---------------------- |
| `DELPHIS_LAUNCH_EDITOR` | `code`     | Editor binary to launch|
| `DELPHIS_USERNAME`      | `delphis`  | SSH username           |
| `DELPHIS_PASSWORD`      | -          | SSH password           |
| `DELPHIS_PORT`          | `22444`    | SSH port               |
| `DELPHIS_FOLDER`        | `/delphis` | Remote folder path     |

### Troubleshooting

**Tailscale not found**: Install from [tailscale.com](https://tailscale.com/download) and ensure it's in your PATH.

**Tailscale not running**: Run `tailscale up` to connect to your Tailnet.

**No environments discovered**: Ensure the remote machine is running `delphis share` and is on your Tailnet.

---

[License](LICENSE) | [Contributing](CONTRIBUTING.md)
