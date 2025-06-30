import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'

export default [
  { ignores: ['dist'] },
  {
    files: ['**/*.{js,jsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
      },
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...js.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,
      
      // Regras originais
      'no-unused-vars': ['error', { 
        varsIgnorePattern: '^[A-Z_]',
        argsIgnorePattern: '^_' 
      }],
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
      
      // ✨ REGRAS DE PERFORMANCE ADICIONADAS
      
      // React Hooks otimizações
      'react-hooks/exhaustive-deps': 'warn',
      
      // Performance geral
      'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
      'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
      
      // Boas práticas modernas
      'prefer-const': 'error',
      'no-var': 'error',
      'object-shorthand': 'warn',
      'prefer-arrow-callback': 'warn',
      'prefer-template': 'warn',
      
      // Otimizações de código
      'no-duplicate-imports': 'error',
      'no-useless-concat': 'warn',
      'prefer-destructuring': ['warn', {
        array: true,
        object: true
      }],
      
      // Prevenção de problemas comuns
      'eqeqeq': 'error',
      'no-eval': 'error',
      'no-implied-eval': 'error',
      'no-new-func': 'error',
      
      // Melhor legibilidade
      'comma-dangle': ['warn', 'only-multiline'],
      'quotes': ['warn', 'single', { avoidEscape: true }],
      'semi': ['warn', 'always'],
      
      // Performance específica do React
      'react/jsx-no-bind': 'off', // Permitir bind em JSX (controlado por useCallback)
      'react/jsx-no-lambda': 'off', // Permitir arrow functions inline (controlado por useCallback)
      
      // Prevenir re-renders desnecessários
      'react/jsx-no-constructed-context-values': 'warn',
      
      // Organização de imports
      'sort-imports': ['warn', {
        ignoreCase: true,
        ignoreDeclarationSort: true,
        ignoreMemberSort: false
      }]
    },
  },
]