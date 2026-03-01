#!/bin/bash
# 进入项目目录（请把下面的路径换成你 Mac 上的实际路径）
cd ~/Project/Trading-Journal

# 这里的路径可以通过在终端输入 pwd 获取
source ~/.nvm/nvm.sh
nvm use --lts
npm run dev
