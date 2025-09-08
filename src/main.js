import { createApp } from 'vue'
import App from './App.vue'
import './style.css'

const app = createApp(App)

// 全局属性
app.config.globalProperties.$electronAPI = window.electronAPI

app.mount('#app')
