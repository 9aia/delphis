#!/bin/bash
set -e

# Default values
USER=${USER:-root}
PASSWORD=${PASSWORD:-password}

if [ "$USER" = "root" ]; then
    echo "Root cannot be used as user to delphis!"
    exit 1
fi

# Create user only if it does not exist
if ! id "$USER" >/dev/null 2>&1; then
    useradd -m -s /bin/bash "$USER"
    echo "$USER:$PASSWORD" | chpasswd
fi

# Permissions
chmod -R 777 /delphis
chown -R "$USER":"$USER" /delphis

# Start SSH in background
/usr/sbin/sshd

# Start delphis-mcd in foreground (PID 1)
exec /delphis-mcd
