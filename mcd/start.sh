#!/bin/bash
set -e

# Default values
USERNAME=${USERNAME:-root}
PASSWORD=${PASSWORD:-password}

# Validate username
if [ "$USERNAME" = "root" ]; then
    echo "Root cannot be used as user to delphis!"
    exit 1
fi

# Create user if it doesn't exist
if ! id "$USERNAME" &>/dev/null; then
    useradd -M -s /bin/bash "$USERNAME"
fi

# Set password
echo "$USERNAME:$PASSWORD" | chpasswd

# Ensure home directory exists with correct permissions
mkdir -p "/home/$USERNAME"
chown "$USERNAME":"$USERNAME" "/home/$USERNAME"

# Set /delphis permissions
chmod -R 777 /delphis
chown -R "$USERNAME":"$USERNAME" /delphis

# Create SSH directory and start service
mkdir -p /run/sshd
/usr/sbin/sshd

# Start delphis in foreground (PID 1)
exec /delphis-mcd
