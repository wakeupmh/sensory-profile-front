import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react({
      // Configuração do SWC para melhorar o desempenho
      plugins: [
        ['@swc/plugin-emotion', {}],
      ],
    }),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['apple-touch-icon.png'],
      manifest: {
        name: 'Perfil Sensorial',
        short_name: 'Sensorial',
        description: 'Acompanhamento sensorial, comportamental e de desenvolvimento infantil',
        lang: 'pt-BR',
        start_url: '/dashboard',
        scope: '/',
        display: 'standalone',
        background_color: '#FFFEF5',
        theme_color: '#FFFEF5',
        icons: [
          { src: '/pwa-192x192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: '/pwa-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          { src: '/pwa-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        // Só o app shell (JS/CSS/fontes/ícones do build) — dados de saúde não
        // devem servir de um cache potencialmente desatualizado; a fila
        // offline de registros (useOfflineLogQueue) já cobre a escrita
        // offline de forma explícita e auditável, então chamadas a /api/
        // ficam de fora do cache do service worker deliberadamente.
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        navigateFallback: '/index.html',
        navigateFallbackDenylist: [/^\/api\//],
      },
    }),
  ],
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
