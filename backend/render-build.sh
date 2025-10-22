#!/usr/bin/env bash
# Install dependencies
echo "Installing npm dependencies..."
npm install

# Install Chromium for Puppeteer on Render
if [ "$NODE_ENV" = "production" ]; then
  echo "Installing Chromium for PDF generation..."
  apt-get update
  apt-get install -y chromium-browser
  echo "Chromium installed successfully"
fi
