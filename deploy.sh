#!/usr/bin/env bash

echo "▶ Installing & building NestJS"
npm install
npm run build                

echo "▶ (Re)starting PM2 process rgt-api"
pm2 delete rgt-api 2>/dev/null || true
pm2 start dist/main.js         \
     --name rgt-api            \
     --env production          \
     --time                    # timestamps in logs

pm2 save                       # auto-restart on reboot
echo "✅ API running on :7000  |  pm2 logs rgt-api"
