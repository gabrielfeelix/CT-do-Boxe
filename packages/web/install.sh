#!/bin/bash
set -e

echo "Installing pnpm 8.15.0..."
npm install -g pnpm@8.15.0

echo "Installing dependencies..."
cd ../..
pnpm install --frozen-lockfile
