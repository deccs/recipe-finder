#!/bin/bash

# AWS Amplify Build Script for Monorepo
# This script handles building both the main app and recipe-app in a monorepo structure

# Check if a phase argument was provided
if [ -z "$1" ]; then
  echo "❌ Error: No phase specified. Use 'preBuild' or 'build'"
  exit 1
fi

PHASE=$1

echo "🚀 Starting AWS Amplify $PHASE phase..."

if [ "$PHASE" = "preBuild" ]; then
  # Install dependencies for root project
  echo "📦 Installing root dependencies..."
  npm ci

  # Install dependencies for recipe-app
  echo "📦 Installing recipe-app dependencies..."
  cd recipe-app && npm ci && cd ..

  # Generate Prisma client
  echo "🔧 Generating Prisma client..."
  npx prisma generate

elif [ "$PHASE" = "build" ]; then
  # Build main application
  echo "🏗️ Building main application..."
  npm run build

  # Build recipe-app
  echo "🏗️ Building recipe-app..."
  cd recipe-app && npm run build && cd ..

else
  echo "❌ Error: Unknown phase '$PHASE'. Use 'preBuild' or 'build'"
  exit 1
fi

echo "✅ $PHASE phase completed successfully!"