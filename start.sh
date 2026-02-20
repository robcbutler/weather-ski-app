#!/bin/sh
# Starts the Canadian Weather dev server using the local Node.js binary.
# Run: ./start.sh
export PATH="/tmp/node-v22.14.0-darwin-arm64/bin:$PATH"
npm run dev
