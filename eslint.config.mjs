// eslint.config.mjs - VERSIÓN SIMPLIFICADA PARA APRENDIZAJE
import eslint from '@eslint/js';
import prettierPlugin from 'eslint-plugin-prettier';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

export default tseslint.config(
  {
    ignores: ['eslint.config.mjs', 'dist/**', 'node_modules/**', '*.js'],
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.ts'],
    plugins: {
      '@typescript-eslint': tseslint.plugin,
      prettier: prettierPlugin,
    },
    rules: {
      // ==================== PRETTIER ====================
      'prettier/prettier': [
        'warn',
        {
          singleQuote: true,
          trailingComma: 'all',
          semi: true,
          printWidth: 100,
          tabWidth: 2,
          useTabs: false,
          bracketSpacing: true,
          arrowParens: 'avoid',
          endOfLine: 'auto',
          bracketSameLine: false,
        },
      ],

      // ==================== REGLAS RELAJADAS ====================
      // Desactiva las reglas más estrictas mientras aprendes
      '@typescript-eslint/no-explicit-any': 'warn', // ✅ Cambia de 'error' a 'warn'
      '@typescript-eslint/no-unsafe-assignment': 'off', // ✅ DESACTIVADO
      '@typescript-eslint/no-unsafe-member-access': 'off', // ✅ DESACTIVADO
      '@typescript-eslint/no-unsafe-call': 'off', // ✅ DESACTIVADO
      '@typescript-eslint/no-unsafe-return': 'off', // ✅ DESACTIVADO
      '@typescript-eslint/no-unsafe-argument': 'off', // ✅ DESACTIVADO
      '@typescript-eslint/no-unnecessary-condition': 'off', // ✅ DESACTIVADO
      '@typescript-eslint/strict-boolean-expressions': 'off', // ✅ DESACTIVADO

      // Promesas (mantén estas, son útiles)
      '@typescript-eslint/no-floating-promises': 'warn',
      '@typescript-eslint/require-await': 'warn',
      '@typescript-eslint/await-thenable': 'warn',

      // Variables no usadas (útil para limpiar código)
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],

      // ==================== JAVASCRIPT GENERAL ====================
      'prefer-const': 'warn',
      'no-var': 'error',
      'no-console': [
        'warn',
        {
          allow: ['warn', 'error', 'info'],
        },
      ],
      'no-debugger': 'error',
      eqeqeq: ['error', 'always'],

      // ==================== MEJORES PRÁCTICAS SUAVES ====================
      '@typescript-eslint/only-throw-error': 'warn',
      '@typescript-eslint/prefer-promise-reject-errors': 'warn',
    },
  },
  {
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.jest,
      },
      sourceType: 'module',
      parserOptions: {
        project: './tsconfig.json',
        tsconfigRootDir: __dirname,
        ecmaVersion: 'latest',
      },
    },
  },
);
