const { spawn } = require('child_process')
const path = require('path')

console.log('🚀 启动开发环境...')

// 启动 Vue 开发服务器
const vueProcess = spawn('npm', ['run', 'dev:vue'], {
  stdio: 'inherit',
  shell: true,
  cwd: path.join(__dirname, '..')
})

// 等待 Vue 服务器启动后启动 Electron
setTimeout(() => {
  console.log('⚡ 启动 Electron...')
  const electronProcess = spawn('npm', ['run', 'dev:electron'], {
    stdio: 'inherit',
    shell: true,
    cwd: path.join(__dirname, '..')
  })
  
  // 处理进程退出
  electronProcess.on('close', (code) => {
    console.log(`Electron 进程退出，代码: ${code}`)
    vueProcess.kill()
    process.exit(code)
  })
}, 3000)

// 处理 Vue 进程退出
vueProcess.on('close', (code) => {
  console.log(`Vue 开发服务器退出，代码: ${code}`)
  process.exit(code)
})

// 处理进程中断
process.on('SIGINT', () => {
  console.log('\n🛑 正在关闭开发服务器...')
  vueProcess.kill()
  process.exit(0)
})
