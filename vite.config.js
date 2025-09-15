import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  plugins: [vue()],
  base: './',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html')
      }
    }
  },
  server: {
    port: 5173,
    host: 'localhost'
  }
})


// module.exports = {
//   pluginOptions: {
//     electronBuilder: {
//       preload: 'public/preload.js', // 明确指定preload文件路径
//       // 其他配置...
//     }
//   }
// };