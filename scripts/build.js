const { execSync } = require('child_process')
const fs = require('fs')
const path = require('path')

console.log('🚀 开始构建 Vue3 + Electron 应用...')

try {
  // 1. 构建 Vue 应用
  console.log('📦 构建 Vue 应用...')
  execSync('npm run build:vue', { stdio: 'inherit' })
  
  // 2. 检查构建输出
  const distPath = path.join(__dirname, '../dist')
  if (!fs.existsSync(distPath)) {
    throw new Error('Vue 构建失败：dist 目录不存在')
  }
  
  console.log('✅ Vue 应用构建完成')
  
  // 3. 构建 Electron 应用
  console.log('⚡ 构建 Electron 应用...')
  execSync('npm run build:electron', { stdio: 'inherit' })
  
  console.log('🎉 应用构建完成！')
  console.log('📁 输出目录: dist-electron/')
  
} catch (error) {
  console.error('❌ 构建失败:', error.message)
  process.exit(1)
}
