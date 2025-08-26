#!/bin/bash

echo "Testing build process..."
cd frontend

echo "Checking package.json..."
if [ ! -f package.json ]; then
  echo "ERROR: package.json not found"
  exit 1
fi

echo "Installing dependencies..."
npm install --silent

echo "Running build..."
npm run build

echo "Build process completed"
