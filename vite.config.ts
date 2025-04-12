import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react({
    // Configuração do SWC para melhorar o desempenho
    plugins: [
      ['@swc/plugin-emotion', {}],
    ],
  })],
  // Otimizações de desempenho
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom', '@radix-ui/themes'],
    exclude: [],
  },
  build: {
    // Minificação e otimização para produção
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
    // Divisão de chunks para melhor carregamento
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'radix-ui': ['@radix-ui/themes', '@radix-ui/react-icons'],
        },
      },
    },
  },
  // Configurações de servidor de desenvolvimento
  server: {
    hmr: {
      overlay: true,
    },
    watch: {
      usePolling: false,
    },
  },
})
