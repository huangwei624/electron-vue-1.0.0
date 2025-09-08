<template>
  <div id="app">
    <!-- 自定义标题栏 -->
    <header class="title-bar" :class="platformClass">
      <div class="title-bar-drag-region">
        <div class="title-bar-content">
          <div class="app-info">
            <div class="app-icon">⚡</div>
            <span class="app-title">Vue3 + Electron 应用</span>
          </div>
          <div class="platform-info">
            <span>平台: {{ platform }}</span>
            <span>版本: {{ appVersion }}</span>
          </div>
        </div>
      </div>
    </header>
    
    <!-- 额外的拖动区域 -->
    <div class="drag-area"></div>

    <!-- 普通头部（非Electron环境） -->
    <!-- <header class="app-header" v-else>
      <h1>Vue3 + Electron 应用</h1>
      <div class="platform-info">
        <span>平台: {{ platform }}</span>
        <span>版本: {{ appVersion }}</span>
      </div>
    </header> -->

    <main class="app-main">
      <div class="welcome-section">
        <h2>欢迎使用跨平台桌面应用</h2>
        <p>这是一个基于Vue3和Electron构建的现代化桌面应用程序</p>
      </div>

      <div class="features-grid">
        <div class="feature-card">
          <div class="feature-icon">🚀</div>
          <h3>现代化技术栈</h3>
          <p>使用Vue3 Composition API和Electron最新版本</p>
        </div>

        <div class="feature-card">
          <div class="feature-icon">🖥️</div>
          <h3>跨平台支持---0101</h3>
          <p>支持Windows、macOS和Linux操作系统</p>
        </div>

        <div class="feature-card">
          <div class="feature-icon">⚡</div>
          <h3>高性能</h3>
          <p>基于Vite构建，开发体验极佳</p>
        </div>

        <div class="feature-card">
          <div class="feature-icon">🎨</div>
          <h3>美观界面</h3>
          <p>现代化的UI设计，用户体验优秀</p>
        </div>
      </div>

      <div class="action-section">
        <button @click="showMessage" class="btn btn-primary">
          显示消息
        </button>
        <button @click="getSystemInfo" class="btn btn-secondary">
          获取系统信息
        </button>
        <button @click="openNewWindow" class="btn btn-success">
          打开新窗口
        </button>
        <button @click="testDrag" class="btn btn-info" v-if="isElectron">
          测试拖动功能
        </button>
        <button @click="showDebugInfo" class="btn btn-warning" v-if="isElectron">
          调试信息
        </button>
        <button @click="toggleDevTools" class="btn btn-secondary" v-if="isElectron">
          开发者工具
        </button>
      </div>

      <div v-if="systemInfo" class="system-info">
        <h3>系统信息</h3>
        <pre>{{ systemInfo }}</pre>
      </div>
    </main>

    <footer class="app-footer">
      <p>&copy; 2024 Vue3 Electron App. 基于Vue3和Electron构建.</p>
    </footer>
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted } from 'vue'

export default {
  name: 'App',
  setup() {
    const platform = ref('')
    const appVersion = ref('')
    const systemInfo = ref('')
    const isElectron = ref(false)
    const isMaximized = ref(false)
    const isMac = ref(false)
    const platformClass = ref('')

    // 获取应用信息
    const loadAppInfo = async () => {
      try {
        if (window.electronAPI) {
          isElectron.value = true
          platform.value = await window.electronAPI.getPlatform()
          appVersion.value = await window.electronAPI.getAppVersion()
          isMaximized.value = await window.electronAPI.windowIsMaximized()
          
          // 检测平台类型
          isMac.value = platform.value === 'darwin'
          platformClass.value = isMac.value ? 'mac-style' : 'win-style'
        } else {
          isElectron.value = false
          platform.value = navigator.platform
          appVersion.value = '1.0.0'
          
          // 浏览器环境下的平台检测
          isMac.value = navigator.platform.toLowerCase().includes('mac')
          platformClass.value = isMac.value ? 'mac-style' : 'win-style'
        }
      } catch (error) {
        console.error('获取应用信息失败:', error)
        isElectron.value = false
      }
    }

    // 窗口控制功能
    const minimizeWindow = async () => {
      if (window.electronAPI) {
        await window.electronAPI.windowMinimize()
      }
    }

    const maximizeWindow = async () => {
      if (window.electronAPI) {
        await window.electronAPI.windowMaximize()
        // 更新最大化状态
        setTimeout(async () => {
          isMaximized.value = await window.electronAPI.windowIsMaximized()
        }, 100)
      }
    }

    const closeWindow = async () => {
      if (window.electronAPI) {
        await window.electronAPI.windowClose()
      }
    }

    // 显示消息
    const showMessage = async () => {
      try {
        if (window.electronAPI) {
          await window.electronAPI.showMessageBox({
            type: 'info',
            title: '消息',
            message: '这是一个来自Vue3的消息！',
            detail: '您正在使用Vue3 + Electron应用程序。'
          })
        } else {
          alert('这是一个来自Vue3的消息！')
        }
      } catch (error) {
        console.error('显示消息失败:', error)
      }
    }

    // 获取系统信息
    const getSystemInfo = () => {
      const info = {
        userAgent: navigator.userAgent,
        platform: navigator.platform,
        language: navigator.language,
        cookieEnabled: navigator.cookieEnabled,
        onLine: navigator.onLine,
        screenWidth: screen.width,
        screenHeight: screen.height,
        windowWidth: window.innerWidth,
        windowHeight: window.innerHeight
      }
      systemInfo.value = JSON.stringify(info, null, 2)
    }

    // 打开新窗口
    const openNewWindow = () => {
      window.open('', '_blank', 'width=800,height=600')
    }

    // 测试拖动功能
    const testDrag = () => {
      if (window.electronAPI) {
        showMessage({
          type: 'info',
          title: '拖动功能测试',
          message: '拖动功能已启用！',
          detail: '请尝试拖动窗口顶部的标题栏区域。\n\n拖动区域：\n• 顶部30px透明区域\n• 标题栏区域（应用图标和标题）\n• 平台信息区域\n\n不可拖动区域：\n• 窗口控制按钮（最小化、最大化、关闭）'
        })
      } else {
        alert('拖动功能仅在Electron环境中可用')
      }
    }

    // 显示调试信息
    const showDebugInfo = async () => {
      if (window.electronAPI) {
        try {
          const debugInfo = await window.electronAPI.getDebugInfo()
          const debugMessage = `调试信息:\n\n` +
            `平台: ${debugInfo.platform}\n` +
            `Node版本: ${debugInfo.version}\n` +
            `开发模式: ${debugInfo.isDev ? '是' : '否'}\n` +
            `主进程调试: ${debugInfo.isDebug ? '是' : '否'}\n` +
            `远程调试: ${debugInfo.isRemoteDebug ? '是' : '否'}\n` +
            `运行时间: ${Math.round(debugInfo.uptime)}秒\n` +
            `内存使用: ${Math.round(debugInfo.memoryUsage.heapUsed / 1024 / 1024)}MB`
          
          showMessage({
            type: 'info',
            title: '调试信息',
            message: debugMessage,
            detail: '这些信息可以帮助您了解应用的运行状态和调试配置。'
          })
        } catch (error) {
          console.error('获取调试信息失败:', error)
          showMessage({
            type: 'error',
            title: '错误',
            message: '获取调试信息失败',
            detail: error.message
          })
        }
      } else {
        alert('调试功能仅在Electron环境中可用')
      }
    }

    // 切换开发者工具
    const toggleDevTools = async () => {
      if (window.electronAPI) {
        try {
          const result = await window.electronAPI.toggleDevTools()
          const message = result.opened ? '开发者工具已打开' : '开发者工具已关闭'
          showMessage({
            type: 'info',
            title: '开发者工具',
            message: message,
            detail: '您也可以使用以下快捷键：\n• F12\n• Cmd+Option+I (macOS)\n• Ctrl+Shift+I (Windows/Linux)\n• 右键菜单'
          })
        } catch (error) {
          console.error('切换开发者工具失败:', error)
          showMessage({
            type: 'error',
            title: '错误',
            message: '切换开发者工具失败',
            detail: error.message
          })
        }
      } else {
        alert('开发者工具功能仅在Electron环境中可用')
      }
    }

    // 菜单事件处理
    const handleMenuNew = () => {
      showMessage()
    }

    const handleMenuOpen = () => {
      getSystemInfo()
    }

    const handleMenuAbout = () => {
      showMessage()
    }

    onMounted(() => {
      loadAppInfo()
      
      // 监听菜单事件
      if (window.electronAPI) {
        window.electronAPI.onMenuNew(handleMenuNew)
        window.electronAPI.onMenuOpen(handleMenuOpen)
        window.electronAPI.onMenuAbout(handleMenuAbout)
      }
    })

    onUnmounted(() => {
      // 清理监听器
      if (window.electronAPI) {
        window.electronAPI.removeAllListeners('menu-new')
        window.electronAPI.removeAllListeners('menu-open')
        window.electronAPI.removeAllListeners('menu-about')
      }
    })

    return {
      platform,
      appVersion,
      systemInfo,
      isElectron,
      isMaximized,
      isMac,
      platformClass,
      showMessage,
      getSystemInfo,
      openNewWindow,
      testDrag,
      showDebugInfo,
      toggleDevTools,
      minimizeWindow,
      maximizeWindow,
      closeWindow
    }
  }
}
</script>
