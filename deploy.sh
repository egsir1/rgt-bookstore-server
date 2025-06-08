#!/usr/bin/env bash

set -e  # exit on error

echo "▶ Pulling latest NestJS code..."
git reset --hard
git checkout master
git pull origin master

echo "▶ Installing dependencies..."
npm install

echo "▶ Building NestJS project..."
npm run build

echo "▶ Restarting PM2 process: rgt-api"
pm2 delete rgt-api 2>/dev/null || true

pm2 start dist/main.js          \
     --name rgt-api             \
     --env production           \
     --time                     \
     --update-env               # reload .env vars

pm2 save

echo "✅ API running on port 7000  |  View logs: pm2 logs rgt-api"
