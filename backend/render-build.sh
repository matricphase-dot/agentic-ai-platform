#!/bin/bash
set -e
echo "=== Starting Render build script ==="
echo "Node version: $(node -v)"
echo "NPM version: $(npm -v)"
echo "Current directory: $(pwd)"
echo "Installing dependencies..."
npm ci || npm install
echo "Running build..."
npm run build
echo "Build complete."
