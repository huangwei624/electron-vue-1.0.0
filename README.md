# Vue3 + Electron 跨平台桌面应用

一个基于 Vue3 和 Electron 构建的现代化跨平台桌面应用程序，支持 Windows、macOS 和 Linux 操作系统。

## ✨ 特性

- 🚀 **现代化技术栈**: 使用 Vue3 Composition API 和 Electron 最新版本
- 🖥️ **跨平台支持**: 支持 Windows、macOS 和 Linux
- ⚡ **高性能**: 基于 Vite 构建，开发体验极佳
- 🎨 **美观界面**: 现代化的 UI 设计，用户体验优秀
- 🔧 **完整配置**: 包含完整的构建、打包和开发环境配置

## 🛠️ 技术栈

- **前端框架**: Vue 3.3.8
- **桌面框架**: Electron 27.1.3
- **构建工具**: Vite 5.0.0
- **打包工具**: electron-builder 24.6.4
- **开发工具**: concurrently, wait-on

## 📦 安装依赖

```bash
npm install
```

## 🚀 开发

启动开发环境（同时启动 Vue 开发服务器和 Electron）：

```bash
npm run dev
```

或者分别启动：

```bash
# 启动 Vue 开发服务器
npm run dev:vue

# 启动 Electron（在另一个终端）
npm run dev:electron
```

## 🏗️ 构建

构建生产版本：

```bash
npm run build
```

## 📱 打包分发

### 打包所有平台

```bash
npm run dist
```

### 打包特定平台

```bash
# Windows
npm run dist:win

# macOS
npm run dist:mac

# Linux
npm run dist:linux
```

### 仅打包不生成安装包

```bash
npm run pack
```

## 📁 项目结构

```
vue3-electron-app/
├── public/                 # 静态资源
│   ├── electron.js        # Electron 主进程
│   ├── preload.js         # 预加载脚本
│   └── icon.svg           # 应用图标
├── src/                   # Vue 源码
│   ├── App.vue           # 主组件
│   ├── main.js           # Vue 入口文件
│   └── style.css         # 全局样式
├── scripts/              # 构建脚本
│   ├── build.js          # 构建脚本
│   └── dev.js            # 开发脚本
├── dist/                 # Vue 构建输出
├── dist-electron/        # Electron 打包输出
├── package.json          # 项目配置
├── vite.config.js        # Vite 配置
└── README.md            # 项目文档
```

## 🔧 配置说明

### Electron 配置

- **主进程**: `public/electron.js` - 负责创建窗口、菜单和系统集成
- **预加载脚本**: `public/preload.js` - 安全地暴露 API 给渲染进程
- **安全设置**: 启用了上下文隔离和禁用 Node.js 集成

### 构建配置

- **Vite**: 配置了 Vue 插件和构建优化
- **electron-builder**: 配置了多平台打包选项
- **跨平台**: 支持 x64 和 arm64 架构

## 🎯 功能特性

### 应用功能

- ✅ 跨平台窗口管理
- ✅ 自定义标题栏和拖动功能
- ✅ 窗口控制按钮（最小化、最大化、关闭）
- ✅ 原生菜单栏
- ✅ 系统信息获取
- ✅ 消息对话框
- ✅ 响应式设计
- ✅ 现代化 UI

### 开发功能

- ✅ 热重载开发
- ✅ 开发者工具
- ✅ 源码映射
- ✅ 错误处理

## 📋 可用脚本

| 脚本 | 描述 |
|------|------|
| `npm run dev` | 启动开发环境 |
| `npm run dev:vue` | 启动 Vue 开发服务器 |
| `npm run dev:electron` | 启动 Electron |
| `npm run build` | 构建生产版本 |
| `npm run build:vue` | 构建 Vue 应用 |
| `npm run build:electron` | 构建 Electron 应用 |
| `npm run dist` | 打包所有平台 |
| `npm run dist:win` | 打包 Windows 版本 |
| `npm run dist:mac` | 打包 macOS 版本 |
| `npm run dist:linux` | 打包 Linux 版本 |
| `npm run pack` | 打包但不生成安装包 |

## 🔒 安全考虑

- 启用了上下文隔离 (`contextIsolation: true`)
- 禁用了 Node.js 集成 (`nodeIntegration: false`)
- 使用预加载脚本安全地暴露 API
- 所有 IPC 通信都经过验证

## 🖱️ 拖动功能

应用支持完整的窗口拖动和控制功能：

### 拖动区域
- **标题栏**: 整个标题栏区域都可以拖动
- **应用信息**: 应用图标和标题部分
- **平台信息**: 显示当前平台和版本信息

### 窗口控制
- **最小化**: 点击最小化按钮将窗口最小化到任务栏
- **最大化/还原**: 点击最大化按钮切换窗口状态
- **关闭**: 点击关闭按钮退出应用

### 样式特性
- **悬停效果**: 按钮有颜色变化的悬停效果
- **响应式**: 在不同屏幕尺寸下自适应
- **现代化**: 符合各平台的设计规范

## 🐛 故障排除

### 常见问题

1. **依赖安装失败**
   ```bash
   # 清理缓存重新安装
   npm cache clean --force
   rm -rf node_modules package-lock.json
   npm install
   ```

2. **网络连接问题（Electron下载失败）**
   ```bash
   # 设置国内镜像源
   npm config set registry https://registry.npmmirror.com
   npm config set electron_mirror https://npmmirror.com/mirrors/electron/
   npm install
   ```

3. **权限问题（macOS/Linux）**
   ```bash
   # 不要使用 sudo 安装全局包
   # 使用 nvm 管理 Node.js 版本
   curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
   nvm install 18
   nvm use 18
   ```

4. **Node.js 版本过低**
   ```bash
   # 检查版本
   node --version
   # 如果版本低于16，请升级到16或更高版本
   ```

5. **快速启动**
   ```bash
   # 使用提供的启动脚本
   ./start.sh
   ```

### 开发环境要求

- Node.js 16.0.0 或更高版本
- npm 7.0.0 或更高版本
- 操作系统：Windows 10+, macOS 10.14+, 或 Linux

## 📄 许可证

MIT License

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📞 支持

如果您遇到任何问题，请：

1. 查看本文档的故障排除部分
2. 搜索现有的 Issues
3. 创建新的 Issue 并提供详细信息

---

**享受使用 Vue3 + Electron 构建您的桌面应用！** 🎉
