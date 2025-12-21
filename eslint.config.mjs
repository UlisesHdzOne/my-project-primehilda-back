// eslint.config.mjs - VERSIÓN BALANCEADA: SEGURO + PRÁCTICO
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

      // ==================== REGLAS DE SEGURIDAD (ACTIVADAS) ====================
      // Errores de TypeScript que TypeScript no detecta bien
      '@typescript-eslint/no-unsafe-assignment': 'warn', // ← ACTIVADO como warn
      '@typescript-eslint/no-unsafe-member-access': 'warn', // ← ACTIVADO como warn
      '@typescript-eslint/no-unsafe-call': 'warn', // ← ACTIVADO como warn
      '@typescript-eslint/no-unsafe-return': 'warn', // ← ACTIVADO como warn
      '@typescript-eslint/no-unsafe-argument': 'warn', // ← ACTIVADO como warn

      // Tipos 'any' - warning para ser consciente
      '@typescript-eslint/no-explicit-any': 'warn', // ← MANTENER warn

      // ==================== REGLAS DE CALIDAD (MODERADAS) ====================
      '@typescript-eslint/no-unnecessary-condition': 'warn', // ← ACTIVADO como warn
      '@typescript-eslint/strict-boolean-expressions': 'off', // ← MANTENER off (muy estricta)

      // ==================== PROMESAS (IMPORTANTES) ====================
      '@typescript-eslint/no-floating-promises': 'error', // ← ERROR (crítico)
      '@typescript-eslint/require-await': 'warn',
      '@typescript-eslint/await-thenable': 'warn',

      // ==================== VARIABLES NO USADAS ====================
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
          allow: ['warn', 'error', 'info'], // ← Permite logs estructurados
        },
      ],
      'no-debugger': 'error',
      eqeqeq: ['error', 'always'], // ← ERROR: === en lugar de ==

      // ==================== MEJORES PRÁCTICAS ====================
      '@typescript-eslint/only-throw-error': 'warn',
      '@typescript-eslint/prefer-promise-reject-errors': 'warn',

      // ==================== REGLAS NUEVAS (PRÁCTICAS) ====================
      '@typescript-eslint/consistent-type-imports': 'warn', // ← Uniformidad en imports
      '@typescript-eslint/no-unnecessary-type-assertion': 'warn',
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
