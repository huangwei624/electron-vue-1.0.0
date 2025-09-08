#!/bin/bash

echo "🚀 启动Vue3 + Electron应用..."

# 清理旧进程
echo "🧹 清理旧进程..."
pkill -f "vite\|electron\|concurrently" 2>/dev/null || true
sleep 2

# 启动Vue开发服务器
echo "📦 启动Vue开发服务器..."
npm run dev:vue &
VUE_PID=$!

# 等待Vue服务器启动
echo "⏳ 等待Vue服务器启动..."
for i in {1..10}; do
    if curl -s http://localhost:5173 >/dev/null 2>&1; then
        echo "✅ Vue服务器启动成功 (尝试 $i/10)"
        break
    fi
    echo "⏳ 等待中... ($i/10)"
    sleep 1
done

# 启动Electron
echo "⚡ 启动Electron..."
npm run build &
npm run dev:electron:debug &
ELECTRON_PID=$!

echo "🎉 应用启动完成！"
echo "📱 您应该能看到Electron应用窗口"
echo "🛑 按Ctrl+C停止应用"

# 等待用户中断
trap 'echo "🛑 正在停止应用..."; kill $VUE_PID $ELECTRON_PID 2>/dev/null; exit 0' INT
wait
