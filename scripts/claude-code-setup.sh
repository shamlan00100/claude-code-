#!/bin/bash
set -e

# Minimal setup script for the 'claude code' environment
# Keep non-critical commands from blocking session start by using || true when appropriate

# Update package lists (allow failure to avoid blocking)
apt update || true

# Install GitHub CLI (non-fatal if install fails)
apt install -y gh || true

# Example: pre-pull small docker image to warm the cache (optional)
# docker pull busybox || true

# Exit zero so session can start even if some installs fail
exit 0
