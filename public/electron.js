const { app, BrowserWindow, Menu, ipcMain } = require('electron')
const path = require('path')
const fs = require('fs')
const os = require('os')

// 判断是否为开发环境：检查NODE_ENV或是否在打包后的应用中
const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged

// 日志配置
const logDir = path.join(os.homedir(), 'Library', 'Logs', 'Vue3-Electron-App')
const logFile = path.join(logDir, `app-${new Date().toISOString().split('T')[0]}.log`)

// 确保日志目录存在
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true })
}

// 简单的日志函数
function logToFile(level, message) {
  const timestamp = new Date().toISOString()
  const logEntry = `[${timestamp}] [${level}] ${message}\n`
  
  try {
    fs.appendFileSync(logFile, logEntry)
  } catch (error) {
    console.error('写入日志失败:', error.message)
  }
}

// 调试配置
const isDebug = process.argv.includes('--inspect') || process.argv.includes('--inspect-brk')
const isRemoteDebug = process.argv.includes('--remote-debugging-port')

// 环境诊断日志
console.log('🔍 环境诊断信息:')
console.log('  - NODE_ENV:', process.env.NODE_ENV)
console.log('  - app.isPackaged:', app.isPackaged)
console.log('  - isDev:', isDev)
console.log('  - isDebug:', isDebug)
console.log('  - isRemoteDebug:', isRemoteDebug)

// 记录应用启动日志
logToFile('INFO', `应用启动 - 环境: ${isDev ? '开发' : '生产'}, 平台: ${process.platform}`)
logToFile('INFO', `日志文件: ${logFile}`)

// 调试日志
if (isDev) {
  console.log('🔍 开发模式已启用')
  if (isDebug) {
    console.log('🐛 主进程调试已启用 (端口: 9229)')
    console.log('💡 在VS Code中按F5或访问 chrome://inspect 开始调试')
  }
  if (isRemoteDebug) {
    console.log('🌐 远程调试已启用 (端口: 9222)')
    console.log('💡 访问 http://localhost:9222 使用Chrome DevTools')
  }
} else {
  console.log('🏭 生产模式已启用 - 调试功能已禁用')
}

let mainWindow

function createWindow() {
  // 创建浏览器窗口
  const windowOptions = {
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    frame: false, // 无边框窗口
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      preload: path.join(__dirname, 'preload.js'),
      webSecurity: false // 允许拖动功能
    },
    icon: path.resolve(__dirname, 'icon/icon.png'), // 应用图标
    show: false,
    backgroundColor: '#667eea', // 窗口背景色
    transparent: false, // 可以根据需要设置为true实现透明效果
    resizable: true,
    minimizable: true,
    maximizable: true,
    closable: true,
    hasShadow: true // 添加阴影效果
  }

  // 根据平台设置不同的标题栏样式
  if (process.platform === 'darwin') {
    // macOS: 完全隐藏系统标题栏和按钮
    windowOptions.titleBarStyle = 'hiddenInset'
    windowOptions.vibrancy = 'under-window' // macOS毛玻璃效果
  } else {
    // Windows/Linux: 隐藏标题栏
    windowOptions.titleBarStyle = 'hidden'
  }

  // 设置应用图标（macOS主要影响程序坞图标）
  if (process.platform === 'darwin') {
    const iconPath = path.resolve(__dirname, 'icon.icns')
    console.log('🔍 macOS图标路径:', iconPath)
    console.log('🔍 macOS图标文件存在:', require('fs').existsSync(iconPath))
    
    // 检查图标文件是否有效
    if (require('fs').existsSync(iconPath)) {
      windowOptions.icon = iconPath
    } else {
      // 如果icns文件不存在，使用PNG作为备选
      const pngIconPath = path.resolve(__dirname, 'icon/icon.png')
      if (require('fs').existsSync(pngIconPath)) {
        console.log('⚠️ 使用PNG图标作为备选方案')
        windowOptions.icon = pngIconPath
      }
    }
  } else {
    const iconPath = path.resolve(__dirname, 'icon/icon.png')
    console.log('🔍 其他平台图标路径:', iconPath)
    console.log('🔍 其他平台图标文件存在:', require('fs').existsSync(iconPath))
    windowOptions.icon = iconPath
  }
  
  mainWindow = new BrowserWindow(windowOptions)

  // 加载应用
  if (isDev) {
    mainWindow.loadURL('http://localhost:5173')
    
    // 调试信息
    console.log('📱 窗口已创建:', {
      width: windowOptions.width,
      height: windowOptions.height,
      platform: process.platform,
      debug: isDebug,
      remoteDebug: isRemoteDebug
    })
    
    // 延迟打开开发者工具，确保页面完全加载
    mainWindow.webContents.once('dom-ready', () => {
      console.log('🔧 页面加载完成，准备打开开发者工具')
      mainWindow.webContents.openDevTools()
    })
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'))
  }

  // 窗口准备好后显示
  mainWindow.once('ready-to-show', () => {
    mainWindow.show()
    logToFile('INFO', '主窗口已显示')
  })

  // 当窗口被关闭时
  mainWindow.on('closed', () => {
    logToFile('INFO', '主窗口已关闭')
    mainWindow = null
    // 窗口关闭时直接退出应用
    app.exit(0)
  })

  // 添加快捷键支持（仅在开发环境）
  if (isDev) {
    mainWindow.webContents.on('before-input-event', (event, input) => {
      // F12 或 Cmd+Option+I (macOS) / Ctrl+Shift+I (Windows/Linux) 打开开发者工具
      if (input.key === 'F12' || 
          (input.meta && input.alt && input.key === 'I') || 
          (input.control && input.shift && input.key === 'I')) {
        event.preventDefault()
        if (mainWindow.webContents.isDevToolsOpened()) {
          mainWindow.webContents.closeDevTools()
        } else {
          mainWindow.webContents.openDevTools()
        }
      }
      
      // Ctrl+R 或 Cmd+R 重新加载
      if ((input.control && input.key === 'r') || (input.meta && input.key === 'r')) {
        event.preventDefault()
        mainWindow.webContents.reload()
      }
    })
  }

  // 添加右键菜单支持（仅在开发环境）
  if (isDev) {
    const { Menu, MenuItem } = require('electron')
    
    mainWindow.webContents.on('context-menu', (event, params) => {
      const menu = new Menu()
      
      // 添加右键菜单项
      menu.append(new MenuItem({
        label: '检查元素',
        click: () => {
          mainWindow.webContents.inspectElement(params.x, params.y)
          if (!mainWindow.webContents.isDevToolsOpened()) {
            mainWindow.webContents.openDevTools()
          }
        }
      }))
      
      menu.append(new MenuItem({
        label: '开发者工具',
        click: () => {
          if (mainWindow.webContents.isDevToolsOpened()) {
            mainWindow.webContents.closeDevTools()
          } else {
            mainWindow.webContents.openDevTools()
          }
        }
      }))
      
      menu.append(new MenuItem({ type: 'separator' }))
      
      menu.append(new MenuItem({
        label: '重新加载',
        click: () => {
          mainWindow.webContents.reload()
        }
      }))
      
      menu.append(new MenuItem({
        label: '强制重新加载',
        click: () => {
          mainWindow.webContents.reloadIgnoringCache()
        }
      }))
      
      menu.popup()
    })
  }
}

// 当 Electron 完成初始化并准备创建浏览器窗口时调用此方法
app.whenReady().then(() => {
  // 设置应用图标（影响程序坞图标）
  if (process.platform === 'darwin') {
    const iconPath = path.resolve(__dirname, 'icon.icns')
    console.log('🔍 设置应用图标:', iconPath)
    console.log('🔍 图标文件存在:', require('fs').existsSync(iconPath))
    
    try {
      app.dock.setIcon(iconPath)
      console.log('✅ 应用图标设置成功')
    } catch (error) {
      console.error('❌ 设置应用图标失败:', error.message)
      // 尝试使用PNG图标作为备选
      const pngIconPath = path.resolve(__dirname, 'icon/icon.png')
      if (require('fs').existsSync(pngIconPath)) {
        try {
          app.dock.setIcon(pngIconPath)
          console.log('✅ 使用PNG图标作为备选方案')
        } catch (pngError) {
          console.error('❌ PNG图标也设置失败:', pngError.message)
        }
      }
    }
  }
  
  createWindow()

  // 在 macOS 上，当单击 dock 图标并且没有其他窗口打开时，
  // 通常在应用程序中重新创建窗口
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })

  // 设置应用菜单
  createMenu()
})

// 当所有窗口都被关闭时退出应用
app.on('window-all-closed', () => {
  logToFile('INFO', '所有窗口已关闭，应用即将退出')
  // 直接退出应用，不区分平台
  app.exit(0)
})

// 创建应用菜单
function createMenu() {
  // 基础菜单项
  const viewSubmenu = [
    { role: 'resetZoom', label: '实际大小' },
    { role: 'zoomIn', label: '放大' },
    { role: 'zoomOut', label: '缩小' },
    { type: 'separator' },
    { role: 'togglefullscreen', label: '全屏' }
  ]
  
  // 在开发环境中添加调试相关菜单项
  if (isDev) {
    viewSubmenu.unshift(
      { role: 'reload', label: '重新加载' },
      { role: 'forceReload', label: '强制重新加载' },
      { role: 'toggleDevTools', label: '开发者工具' },
      { type: 'separator' }
    )
  }
  
  const template = [
    {
      label: '文件',
      submenu: [
        {
          label: '新建',
          accelerator: 'CmdOrCtrl+N',
          click: () => {
            mainWindow.webContents.send('menu-new')
          }
        },
        {
          label: '打开',
          accelerator: 'CmdOrCtrl+O',
          click: () => {
            mainWindow.webContents.send('menu-open')
          }
        },
        { type: 'separator' },
        {
          label: '退出',
          accelerator: process.platform === 'darwin' ? 'Cmd+Q' : 'Ctrl+Q',
          click: () => {
            // 强制退出应用
            app.exit(0)
          }
        }
      ]
    },
    {
      label: '编辑',
      submenu: [
        { role: 'undo', label: '撤销' },
        { role: 'redo', label: '重做' },
        { type: 'separator' },
        { role: 'cut', label: '剪切' },
        { role: 'copy', label: '复制' },
        { role: 'paste', label: '粘贴' }
      ]
    },
    {
      label: '视图',
      submenu: viewSubmenu
    },
    {
      label: '窗口',
      submenu: [
        { role: 'minimize', label: '最小化' },
        { role: 'close', label: '关闭' }
      ]
    },
    {
      label: '帮助',
      submenu: [
        {
          label: '关于',
          click: () => {
            mainWindow.webContents.send('menu-about')
          }
        }
      ]
    }
  ]

  const menu = Menu.buildFromTemplate(template)
  Menu.setApplicationMenu(menu)
}

// IPC 通信处理
ipcMain.handle('get-app-version', () => {
  return app.getVersion()
})

ipcMain.handle('get-platform', () => {
  return process.platform
})

ipcMain.handle('show-message-box', async (event, options) => {
  const { dialog } = require('electron')
  const result = await dialog.showMessageBox(mainWindow, options)
  return result
})

// 窗口控制功能
ipcMain.handle('window-minimize', () => {
  if (mainWindow) {
    mainWindow.minimize()
  }
})

ipcMain.handle('window-maximize', () => {
  if (mainWindow) {
    if (mainWindow.isMaximized()) {
      mainWindow.unmaximize()
    } else {
      mainWindow.maximize()
    }
  }
})

ipcMain.handle('window-close', () => {
  if (mainWindow) {
    mainWindow.close()
    // 直接退出应用，而不是仅仅关闭窗口
    app.exit(0)
  }
})

ipcMain.handle('window-is-maximized', () => {
  return mainWindow ? mainWindow.isMaximized() : false
})

// 日志相关IPC处理
ipcMain.handle('get-log-info', () => {
  return {
    logDir: logDir,
    logFile: logFile,
    logExists: fs.existsSync(logFile)
  }
})

ipcMain.handle('open-log-folder', () => {
  const { shell } = require('electron')
  shell.openPath(logDir)
  return { success: true }
})

// 调试相关IPC处理（仅在开发环境）
if (isDev) {
  ipcMain.handle('debug-info', () => {
    return {
      platform: process.platform,
      version: process.version,
      isDev: isDev,
      isDebug: isDebug,
      isRemoteDebug: isRemoteDebug,
      memoryUsage: process.memoryUsage(),
      uptime: process.uptime()
    }
  })

  ipcMain.handle('debug-log', (event, level, message, data) => {
    const timestamp = new Date().toISOString()
    const logMessage = `[${timestamp}] [${level}] ${message}`
    
    if (data) {
      console.log(logMessage, data)
    } else {
      console.log(logMessage)
    }
    
    return { success: true, timestamp }
  })

  // 开发者工具控制
  ipcMain.handle('toggle-dev-tools', () => {
    if (mainWindow) {
      if (mainWindow.webContents.isDevToolsOpened()) {
        mainWindow.webContents.closeDevTools()
        return { opened: false }
      } else {
        mainWindow.webContents.openDevTools()
        return { opened: true }
      }
    }
    return { opened: false }
  })

  ipcMain.handle('open-dev-tools', () => {
    if (mainWindow) {
      mainWindow.webContents.openDevTools()
      return { success: true }
    }
    return { success: false }
  })

  ipcMain.handle('close-dev-tools', () => {
    if (mainWindow) {
      mainWindow.webContents.closeDevTools()
      return { success: true }
    }
    return { success: false }
  })
}
