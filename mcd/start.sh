#!/bin/bash
set -e

# Default values
USERNAME=${USERNAME:-root}
PASSWORD=${PASSWORD:-password}

if [ "$USERNAME" = "root" ]; then
    echo "Root cannot be used as user to delphis!"
    exit 1
fi

# Create user only if it does not exist
if ! id "$USERNAME" >/dev/null 2>&1; then
    useradd -m -s /bin/bash "$USERNAME"
    echo "$USERNAME:$PASSWORD" | chpasswd
fi

# Permissions
chmod -R 777 /delphis
chown -R "$USERNAME":"$USERNAME" /delphis

# Start SSH in background
/usr/sbin/sshd

# Start delphis in foreground (PID 1)
exec /delphis-mcd
