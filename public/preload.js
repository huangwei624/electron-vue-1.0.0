const { contextBridge, ipcRenderer } = require('electron')

// 调试信息
console.log('🔍 Preload.js 调试信息:')
console.log('  - contextBridge 可用:', typeof contextBridge)
console.log('  - ipcRenderer 可用:', typeof ipcRenderer)
console.log('  - 环境:', process.env.NODE_ENV || 'production')

// 同时记录到文件
try {
  ipcRenderer.invoke('log-to-file', 'DEBUG', 'Preload.js 开始加载')
  ipcRenderer.invoke('log-to-file', 'DEBUG', `contextBridge 可用: ${typeof contextBridge}`)
  ipcRenderer.invoke('log-to-file', 'DEBUG', `ipcRenderer 可用: ${typeof ipcRenderer}`)
} catch (error) {
  console.error('记录日志失败:', error)
}

// 暴露安全的API给渲染进程
contextBridge.exposeInMainWorld('electronAPI', {
  // 获取应用版本
  getAppVersion: async () => {
    try {
      return await ipcRenderer.invoke('get-app-version')
    } catch (error) {
      console.error('获取应用版本失败:', error)
      throw error
    }
  },
  
  // 获取平台信息
  getPlatform: async () => {
    try {
      return await ipcRenderer.invoke('get-platform')
    } catch (error) {
      console.error('获取平台信息失败:', error)
      throw error
    }
  },
  
  // 显示消息框
  showMessageBox: async (options) => {
    try {
      return await ipcRenderer.invoke('show-message-box', options)
    } catch (error) {
      console.error('显示消息框失败:', error)
      throw error
    }
  },
  
  // 窗口控制
  windowMinimize: async () => {
    try {
      return await ipcRenderer.invoke('window-minimize')
    } catch (error) {
      console.error('最小化窗口失败:', error)
      throw error
    }
  },
  windowMaximize: async () => {
    try {
      return await ipcRenderer.invoke('window-maximize')
    } catch (error) {
      console.error('最大化窗口失败:', error)
      throw error
    }
  },
  windowClose: async () => {
    try {
      return await ipcRenderer.invoke('window-close')
    } catch (error) {
      console.error('关闭窗口失败:', error)
      throw error
    }
  },
  windowIsMaximized: async () => {
    try {
      return await ipcRenderer.invoke('window-is-maximized')
    } catch (error) {
      console.error('获取窗口最大化状态失败:', error)
      throw error
    }
  },
  
  // 调试功能
  getDebugInfo: async () => {
    try {
      return await ipcRenderer.invoke('debug-info')
    } catch (error) {
      console.error('获取调试信息失败:', error)
      throw error
    }
  },
  debugLog: async (level, message, data) => {
    try {
      return await ipcRenderer.invoke('debug-log', level, message, data)
    } catch (error) {
      console.error('记录调试日志失败:', error)
      throw error
    }
  },

  // 写入日志
  logToFile: async (level, message) => {
    try {
      return await ipcRenderer.invoke('log-to-file', level, message)
    } catch (error) {
      console.error('写入日志失败:', error)
      throw error
    }
  },
  
  // 开发者工具控制（仅在开发环境可用）
  toggleDevTools: async () => {
    try {
      return await ipcRenderer.invoke('toggle-dev-tools')
    } catch (error) {
      console.warn('开发者工具功能在生产环境中不可用')
      return Promise.resolve({ opened: false })
    }
  },
  openDevTools: () => {
    try {
      return ipcRenderer.invoke('open-dev-tools')
    } catch (error) {
      console.warn('开发者工具功能在生产环境中不可用')
      return Promise.resolve({ success: false })
    }
  },
  closeDevTools: () => {
    try {
      return ipcRenderer.invoke('close-dev-tools')
    } catch (error) {
      console.warn('开发者工具功能在生产环境中不可用')
      return Promise.resolve({ success: false })
    }
  },
  
  // 监听菜单事件
  onMenuNew: (callback) => {
    try {
      ipcRenderer.on('menu-new', callback)
    } catch (error) {
      console.error('注册菜单新建事件监听失败:', error)
    }
  },
  onMenuOpen: (callback) => {
    try {
      ipcRenderer.on('menu-open', callback)
    } catch (error) {
      console.error('注册菜单打开事件监听失败:', error) 
    }
  },
  onMenuAbout: (callback) => {
    try {
      ipcRenderer.on('menu-about', callback)
    } catch (error) {
      console.error('注册菜单关于事件监听失败:', error)
    }
  },
  
  // 移除监听器
  removeAllListeners: (channel) => {
    try {
      ipcRenderer.removeAllListeners(channel)
    } catch (error) {
      console.error('移除事件监听器失败:', error)
    }
  }

  
})
