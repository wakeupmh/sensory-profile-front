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
  resolve: {
    dedupe: ['react', 'react-dom'],
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom', '@radix-ui/themes', '@supabase/auth-ui-react', '@supabase/auth-ui-shared'],
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
    // Divisão de chunks para melhor carregamento.
    // Usa uma função (não o atalho de objeto) porque o atalho casa pelo
    // especificador exato do import — main.tsx importa 'react-dom/client'
    // (entry point do React 18+), que não bate com o literal 'react-dom',
    // deixando o reconciler do react-dom vazar pro chunk principal.
    // Checar o id resolvido pega qualquer subpath do pacote.
    rollupOptions: {
      output: {
        manualChunks(id: string) {
          if (id.includes('node_modules/react-dom') || id.includes('node_modules/react/') || id.includes('node_modules/react-router-dom')) {
            return 'react-vendor';
          }
          if (id.includes('node_modules/@radix-ui/themes') || id.includes('node_modules/@radix-ui/react-icons')) {
            return 'radix-ui';
          }
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
