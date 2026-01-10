# Delphis

A CLI tool for creating and joining secure remote development environments using Tailscale and VS Code Remote SSH.

A CLI tool for creating and joining secure remote development environments using Tailscale and VS Code Remote SSH.

## Overview

Delphis enables seamless remote development by combining:
- **Tailscale** for secure, zero-config networking
- **SSH** for remote access
- **VS Code Remote SSH protocol** for editor compatibility

Works with VS Code, Cursor, and any editor that supports the VS Code Remote SSH protocol.

## Features

- 🔒 **Secure by default** - Uses Tailscale's encrypted mesh VPN
- 🚀 **Zero-config networking** - No port forwarding or firewall rules needed
- 💻 **Editor agnostic** - Works with VS Code, Cursor, and compatible editors
- 🐳 **Docker-based** - Easy to deploy and manage remote environments
- ⚡ **Fast setup** - Get started in minutes

## Prerequisites

- [Bun](https://bun.sh) runtime
- [Tailscale](https://tailscale.com) installed and configured
- [Docker](https://www.docker.com) (for sharing environments)
- A Tailscale API access token
- VS Code, Cursor, or compatible editor

## Installation

```bash
# Clone the repository
git clone https://github.com/9aia/delphis.git
cd delphis

# Install dependencies
bun install
```

## Configuration

Delphis uses environment variables for configuration. Create a `.env` file in the project root:

```env
# Required: Tailscale API credentials
DELPHIS_TAILSCALE_API_ACCESS_TOKEN=your_api_token_here
DELPHIS_TAILSCALE_TAILNET_ID=your_tailnet_id_here

# Optional: Editor settings
DELPHIS_LAUNCH_EDITOR=code  # or 'cursor' or path to your editor

# Optional: SSH connection settings
DELPHIS_USERNAME=delphis
DELPHIS_PASSWORD=your_password  # Optional, for password authentication
DELPHIS_PORT=22444

# Optional: Remote folder path
DELPHIS_FOLDER=./delphis
```

### Getting Tailscale API Credentials

1. Go to [Tailscale Admin Console](https://login.tailscale.com/admin/settings/keys)
2. Create an API access token
3. Get your Tailnet ID from the admin console URL or API

## Usage

### Share a Development Environment

Start sharing your current directory as a remote development environment:

```bash
bun run start share
```

This will:
- Start a Docker container with SSH server
- Mount your current directory into the container
- Make it accessible via Tailscale network

Options:
- `-d, --detach` - Run in detached mode
- `-r, --readonly` - Mount the directory as read-only

### Join a Remote Environment

Connect to a remote development environment:

```bash
bun run start join
```

This will:
- Check if Tailscale is installed and running
- Discover the remote host on your Tailnet
- Open your editor with the remote connection

You can pass additional arguments to your editor:

```bash
bun run start join -- --new-window
```

### Stop a Remote Environment

Stop the running Docker container:

```bash
bun run start stop
```

### Get Help

```bash
bun run start help
bun run start --help
```

## How It Works

1. **Sharing**: When you run `share`, Delphis:
   - Starts a Docker container with an SSH server
   - Configures the container to use host networking
   - Mounts your project directory into the container
   - The container is accessible via Tailscale IP addresses

2. **Joining**: When you run `join`, Delphis:
   - Verifies Tailscale is installed and running
   - Discovers the remote host on your Tailnet
   - Builds an SSH remote authority string
   - Launches your editor with the remote connection

3. **Security**: All traffic is encrypted through Tailscale's mesh VPN, ensuring secure communication without exposing ports to the public internet.

## Architecture

```
┌─────────────────┐         ┌──────────────────┐
│   Your Machine  │         │  Remote Machine  │
│                 │         │                  │
│  ┌───────────┐  │         │  ┌────────────┐  │
│  │  Editor   │  │◄───────►│  │ SSH Server │  │
│  │ (VS Code) │  │  SSH    │  │  (Docker)  │  │
│  └───────────┘  │         │  └────────────┘  │
│       │         │         │        │         │
│  ┌───────────┐  │         │  ┌────────────┐  │
│  │ Tailscale │  │◄───────►│  │ Tailscale  │  │
│  │  Client   │  │  VPN    │  │  Client    │  │
│  └───────────┘  │         │  └────────────┘  │
└─────────────────┘         └──────────────────┘
```

## Development

### Setup

```bash
# Install dependencies
bun install

# Run in development mode (with watch)
bun run dev

# Type check
bun run typecheck

# Lint
bun run lint
bun run lint:fix

# Run tests
bun test
```

### Project Structure

```
delphis/
├── cli/                 # CLI application
│   ├── commands/        # Command implementations
│   ├── lib/            # Shared libraries
│   └── main.ts         # Entry point
├── ssh-server/         # Docker setup for SSH server
├── types/              # TypeScript type definitions
├── tests/              # Test files
└── package.json
```

## Environment Variables Reference

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `DELPHIS_TAILSCALE_API_ACCESS_TOKEN` | Yes | - | Tailscale API access token |
| `DELPHIS_TAILSCALE_TAILNET_ID` | Yes | - | Your Tailscale Tailnet ID |
| `DELPHIS_LAUNCH_EDITOR` | No | `code` | Editor binary to launch |
| `DELPHIS_USERNAME` | No | `delphis` | SSH username |
| `DELPHIS_PASSWORD` | No | - | SSH password (optional) |
| `DELPHIS_PORT` | No | `22444` | SSH port |
| `DELPHIS_FOLDER` | No | `./delphis` | Remote folder path |

## Troubleshooting

### Tailscale is not installed
Make sure Tailscale is installed and in your PATH. Install from [tailscale.com](https://tailscale.com/download).

### Tailscale is not up
Start Tailscale and ensure it's connected to your Tailnet:
```bash
tailscale up
```

### Docker container fails to start
- Ensure Docker is running
- Check that the required ports are available
- Verify environment variables are set correctly

### Editor doesn't connect
- Verify the remote host is accessible via Tailscale
- Check that SSH is running on the remote container
- Ensure your editor supports VS Code Remote SSH protocol

## License

MIT License - see [LICENSE](LICENSE) file for details.

Copyright (c) 2024-present Luis Emidio and Vinicius Emidio Bosi
