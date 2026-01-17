#!/bin/bash
set -e

# Default values
USERNAME=${USERNAME:-root}
PASSWORD=${PASSWORD:-password}
HOST_UID=${HOST_UID:-1000}
HOST_GID=${HOST_GID:-1000}

# Validate username
if [ "$USERNAME" = "root" ]; then
    echo "Root cannot be used as user to delphis!"
    exit 1
fi

# Remove any existing user with target UID or username
getent passwd "$HOST_UID" | cut -d: -f1 | xargs -r userdel -r 2>/dev/null || true
id "$USERNAME" &>/dev/null && userdel -r "$USERNAME" 2>/dev/null || true

# Create group if needed
getent group "$HOST_GID" &>/dev/null || groupadd -g "$HOST_GID" "$USERNAME"

# Create user with host UID/GID
useradd -M -s /bin/bash -u "$HOST_UID" -g "$HOST_GID" "$USERNAME"

# Set password
echo "$USERNAME:$PASSWORD" | chpasswd

# Ensure home directory exists with correct permissions
mkdir -p "/home/$USERNAME"
chown "$HOST_UID":"$HOST_GID" "/home/$USERNAME"

# Set /delphis permissions to match host user
# Using chmod 777 to ensure full access, but ownership matches host
chmod -R 777 /delphis
chown -R "$HOST_UID":"$HOST_GID" /delphis

# Create SSH directory and start service
mkdir -p /run/sshd
/usr/sbin/sshd

# Start delphis in foreground (PID 1)
exec /delphis-mcd
