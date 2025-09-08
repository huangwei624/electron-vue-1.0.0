const { app, BrowserWindow, Menu, ipcMain } = require('electron')
const path = require('path')
const isDev = process.env.NODE_ENV === 'development'

// 调试配置
const isDebug = process.argv.includes('--inspect') || process.argv.includes('--inspect-brk')
const isRemoteDebug = process.argv.includes('--remote-debugging-port')

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
    icon: path.join(__dirname, 'icon.png'), // 应用图标
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
  })

  // 当窗口被关闭时
  mainWindow.on('closed', () => {
    mainWindow = null
  })

  // 添加快捷键支持
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

  // 添加右键菜单支持
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

// 当 Electron 完成初始化并准备创建浏览器窗口时调用此方法
app.whenReady().then(() => {
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
  // 在 macOS 上，除非用户用 Cmd + Q 确定地退出，
  // 否则绝大部分应用及其菜单栏会保持激活
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// 创建应用菜单
function createMenu() {
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
            app.quit()
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
      submenu: [
        { role: 'reload', label: '重新加载' },
        { role: 'forceReload', label: '强制重新加载' },
        { role: 'toggleDevTools', label: '开发者工具' },
        { type: 'separator' },
        { role: 'resetZoom', label: '实际大小' },
        { role: 'zoomIn', label: '放大' },
        { role: 'zoomOut', label: '缩小' },
        { type: 'separator' },
        { role: 'togglefullscreen', label: '全屏' }
      ]
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
  }
})

ipcMain.handle('window-is-maximized', () => {
  return mainWindow ? mainWindow.isMaximized() : false
})

// 调试相关IPC处理
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
