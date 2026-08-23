import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  esbuild: {
    drop: ['console', 'debugger'],
  },
  plugins: [
    react({
      // Configuração do SWC para melhorar o desempenho
      plugins: [
        ['@swc/plugin-emotion', {}],
      ],
    }),
    VitePWA({
      // injectManifest (em vez do generateSW padrão) porque o service worker
      // agora também lida com notificações push (self.addEventListener em
      // 'push'/'notificationclick', em src/sw.ts) — o generateSW não permite
      // adicionar listeners customizados ao worker que ele gera sozinho.
      strategies: 'injectManifest',
      srcDir: 'src',
      filename: 'sw.ts',
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
      injectManifest: {
        // Só o app shell (JS/CSS/fontes/ícones do build) — dados de saúde não
        // devem servir de um cache potencialmente desatualizado; a fila
        // offline de registros (useOfflineLogQueue) já cobre a escrita
        // offline de forma explícita e auditável, então chamadas a /api/
        // ficam de fora do cache do service worker deliberadamente (ver o
        // NavigationRoute com denylist em src/sw.ts).
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
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
    // esbuild (padrão do Vite) em vez de terser. Com `terser` +
    // `drop_console: true` o bundle saía QUEBRADO: a declaração da classe
    // `AIRateLimitError` desaparecia do chunk, mas o nome continuava na lista
    // de exports — e o navegador falhava logo na inicialização do módulo com
    // "Export 'AIRateLimitError' is not defined in module", deixando a página
    // em branco. O app inteiro não subia em produção.
    //
    // Isolado por bisseção: só `drop_console` dispara; sem ele o mesmo terser
    // gera bundle correto. Como o objetivo era remover logs, `esbuild.drop`
    // faz isso corretamente (e mais rápido).
    minify: 'esbuild',
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
          // Dependências que praticamente nunca mudam, mas que estavam
          // misturadas ao código do app no chunk de entrada: qualquer deploy
          // trocava o hash das três e o usuário rebaixava tudo de novo,
          // mesmo quando só uma tela mudou.
          if (id.includes('node_modules/@supabase/')) {
            return 'supabase';
          }
          if (id.includes('node_modules/i18next') || id.includes('node_modules/react-i18next')) {
            return 'i18n';
          }
          if (id.includes('node_modules/axios')) {
            return 'axios';
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
