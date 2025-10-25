#!/bin/bash
# start.sh - Startup script for Astro WhatsApp Bot
# This script is used by Railway when deploying from GitHub

# Install dependencies
npm ci --only=production

# Start the application
node src/server.js