import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'

export default tseslint.config(
  { ignores: ['dist'] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
    },
  },
  {
    // O que entra no primeiro carregamento ("/", login, páginas legais). O
    // pacote de ícones é um módulo único (~95KB com os ícones do app todo) e
    // o cliente do Supabase só deve baixar via lib/loadSupabase.
    files: [
      'src/main.tsx', 'src/App.tsx', 'src/i18n/index.ts', 'src/context/*.tsx',
      'src/components/ErrorBoundary.tsx', 'src/components/LoadingSpinner.tsx',
      'src/components/design-system/Gumroad{Button,Card,Heading}.tsx',
      'src/pages/{LandingPage,PrivacyPolicyPage,TermsOfServicePage,SignIn}.tsx',
    ],
    ignores: ['**/*.test.{ts,tsx}'],
    rules: {
      'no-restricted-imports': ['error', {
        paths: [{ name: '@radix-ui/react-icons', message: 'Use src/components/publicIcons.tsx on first-load code.' }],
        patterns: [{ regex: 'lib/supabase$', message: 'Load the client with loadSupabase() from lib/loadSupabase.' }],
      }],
    },
  },
)
