#!/bin/bash

# --- 配置区 ---
DB_NAME="sqlite.db"      
BACKUP_DIR="./backups"   
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")

# --- 1. 自动创建备份文件夹 ---
if [ ! -d "$BACKUP_DIR" ]; then
  mkdir -p "$BACKUP_DIR"
  echo "📁 已创建备份文件夹"
fi

# --- 2. 执行本地备份 ---
if [ -f "$DB_NAME" ]; then
  cp "$DB_NAME" "$BACKUP_DIR/backup_$TIMESTAMP.db"
  echo "✅ 数据库已备份至: $BACKUP_DIR/backup_$TIMESTAMP.db"
  
  # 只保留最近的 5 个备份
  ls -t $BACKUP_DIR/backup_*.db 2>/dev/null | tail -n +6 | xargs rm -f 2>/dev/null
else
  echo "⚠️ 未发现数据库文件 $DB_NAME，跳过备份"
fi

# --- 3. 推送代码到 GitHub ---
echo "📤 正在同步代码到 GitHub..."
git add .
git commit -m "Vibe Update: $TIMESTAMP (Auto-backup)"
git push origin main

echo "🚀 全部完成！"
