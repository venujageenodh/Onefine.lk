#!/bin/bash
cd /home/ubuntu/onefine-sever
export HOME=/home/ubuntu
export PORT=4000
NODE_PATH=/home/ubuntu/.nvm/versions/node/v22.22.1/bin/node
pkill -f index.js || true
nohup $NODE_PATH index.js > server.log 2>&1 &
echo "Server started with PID $!"
