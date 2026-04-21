// 导入Vite和Vue插件
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// 定义Vite配置
export default defineConfig({
  // 插件配置
  plugins: [vue()],
  // 服务器配置
  server: {
    // 开发服务器端口
    port: 5173,
    // 代理配置，用于跨域请求
    proxy: {
      // 代理/api路径到后端服务器
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  }
})