import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig, loadEnv } from 'vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  // Tự động chọn Cổng Test (gdbhyt) hoặc Cổng Thật (egw) theo VITE_BHXH_ENV
  const defaultTarget =
    env.VITE_BHXH_ENV === 'production'
      ? 'https://egw.baohiemxahoi.gov.vn' // Cổng Chính Thức (Thật)
      : 'https://gdbhyt.baohiemxahoi.gov.vn' // Cổng Test / Demo của BHXH Việt Nam

  const targetUrl = env.VITE_BHXH_TARGET_URL || defaultTarget

  return {
    plugins: [
      tailwindcss(),
      react()
    ],
    server: {
      proxy: {
        '/api-bhxh': {
          target: targetUrl,
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path.replace(/^\/api-bhxh/, ''),
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
            'Accept': 'application/json, text/plain, */*',
          },
        },
        '/api-smartca-prod': {
          target: 'https://gwsca.vnpt.vn',
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path.replace(/^\/api-smartca-prod/, ''),
        },
        '/api-smartca-demo': {
          target: 'https://rmgateway.vnptit.vn',
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path.replace(/^\/api-smartca-demo/, ''),
        },
      },
    },
  }
})
