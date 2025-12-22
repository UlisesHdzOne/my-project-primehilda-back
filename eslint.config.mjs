/**
 * ESLINT CONFIGURATION - STRICT TYPE-SAFE SETUP
 *
 * FILOSOFÍA:
 * - Prevenir bugs > Comodidad
 * - Type safety > Flexibilidad
 * - Errores claros > Warnings ignorados
 *
 * REGLAS CLAVE:
 * - no-explicit-any: warn (permite casos justificados)
 * - no-unsafe-*: error (nunca permitir operaciones inseguras)
 * - no-floating-promises: error (crítico para async)
 * - strict-boolean-expressions: off (demasiado estricta)
 */

import eslint from '@eslint/js';
import prettierPlugin from 'eslint-plugin-prettier';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

export default tseslint.config(
  // ==================== ARCHIVOS IGNORADOS ====================
  {
    ignores: [
      'eslint.config.mjs',
      'dist/**',
      'node_modules/**',
      'coverage/**',
      'logs/**',
      '*.js',
      '**/*.d.ts',
    ],
  },

  // ==================== CONFIGURACIONES BASE ====================
  eslint.configs.recommended,
  ...tseslint.configs.strictTypeChecked,
  ...tseslint.configs.stylisticTypeChecked,

  // ==================== CONFIGURACIÓN PRINCIPAL ====================
  {
    files: ['**/*.ts'],

    plugins: {
      '@typescript-eslint': tseslint.plugin,
      prettier: prettierPlugin,
    },

    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        project: './tsconfig.json',
        tsconfigRootDir: __dirname,
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
      globals: {
        ...globals.node,
        ...globals.jest,
      },
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

      // ==================== TYPE SAFETY (CRÍTICO) ====================
      '@typescript-eslint/no-explicit-any': 'warn', // Permite any justificado con comentario
      '@typescript-eslint/no-unsafe-assignment': 'error', // ❌ NUNCA permitir
      '@typescript-eslint/no-unsafe-member-access': 'error', // ❌ NUNCA permitir
      '@typescript-eslint/no-unsafe-call': 'error', // ❌ NUNCA permitir
      '@typescript-eslint/no-unsafe-return': 'error', // ❌ NUNCA permitir
      '@typescript-eslint/no-unsafe-argument': 'error', // ❌ NUNCA permitir

      // ==================== ASYNC/PROMISES (CRÍTICO) ====================
      '@typescript-eslint/no-floating-promises': 'error', // ❌ Crítico
      '@typescript-eslint/require-await': 'warn',
      '@typescript-eslint/await-thenable': 'error',
      '@typescript-eslint/no-misused-promises': 'error',
      '@typescript-eslint/promise-function-async': 'warn',

      // ==================== VARIABLES NO USADAS ====================
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
          destructuredArrayIgnorePattern: '^_',
          args: 'after-used',
          ignoreRestSiblings: true,
        },
      ],

      // ==================== NULLISH/UNDEFINED ====================
      '@typescript-eslint/no-unnecessary-condition': 'warn',
      '@typescript-eslint/strict-boolean-expressions': 'off', // Demasiado estricta
      '@typescript-eslint/prefer-nullish-coalescing': 'warn',
      '@typescript-eslint/prefer-optional-chain': 'warn',

      // ==================== TYPE ASSERTIONS ====================
      '@typescript-eslint/no-non-null-assertion': 'warn', // Permitir con justificación
      '@typescript-eslint/no-unnecessary-type-assertion': 'warn',
      '@typescript-eslint/consistent-type-assertions': [
        'error',
        {
          assertionStyle: 'as',
          objectLiteralTypeAssertions: 'allow-as-parameter',
        },
      ],

      // ==================== IMPORTS/EXPORTS ====================
      '@typescript-eslint/consistent-type-imports': [
        'warn',
        {
          prefer: 'type-imports',
          disallowTypeAnnotations: false,
          fixStyle: 'separate-type-imports',
        },
      ],
      '@typescript-eslint/consistent-type-exports': 'warn',
      '@typescript-eslint/no-import-type-side-effects': 'error',

      // ==================== ERROR HANDLING ====================
      '@typescript-eslint/only-throw-error': 'error',
      '@typescript-eslint/prefer-promise-reject-errors': 'warn',
      '@typescript-eslint/no-throw-literal': 'off', // Conflicto con only-throw-error

      // ==================== CODE QUALITY ====================
      '@typescript-eslint/no-redundant-type-constituents': 'warn',
      '@typescript-eslint/no-unnecessary-type-arguments': 'warn',
      '@typescript-eslint/prefer-readonly': 'warn',
      '@typescript-eslint/prefer-readonly-parameter-types': 'off', // Demasiado estricta
      '@typescript-eslint/prefer-string-starts-ends-with': 'warn',
      '@typescript-eslint/prefer-includes': 'warn',

      // ==================== NAMING CONVENTIONS ====================
      '@typescript-eslint/naming-convention': [
        'warn',
        {
          selector: 'default',
          format: ['camelCase'],
          leadingUnderscore: 'allow',
          trailingUnderscore: 'forbid',
        },
        {
          selector: 'variable',
          format: ['camelCase', 'UPPER_CASE', 'PascalCase'],
          leadingUnderscore: 'allow',
        },
        {
          selector: 'typeLike',
          format: ['PascalCase'],
        },
        {
          selector: 'enumMember',
          format: ['PascalCase', 'UPPER_CASE'],
        },
        {
          selector: 'property',
          format: null, // Permite cualquier formato (para APIs externas)
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
      'no-implicit-coercion': 'warn',
      'no-param-reassign': [
        'warn',
        {
          props: false,
        },
      ],

      // ==================== COMPLEJIDAD ====================
      complexity: ['warn', 15],
      'max-depth': ['warn', 4],
      'max-lines-per-function': ['warn', { max: 100, skipBlankLines: true, skipComments: true }],

      // ==================== NESTJS ESPECÍFICO ====================
      '@typescript-eslint/interface-name-prefix': 'off',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-extraneous-class': [
        'error',
        {
          allowWithDecorator: true, // Permite classes con decorators de NestJS
        },
      ],

      // ==================== DESACTIVAR REGLAS CONFLICTIVAS ====================
      '@typescript-eslint/unbound-method': 'off', // Problemas con decorators
      '@typescript-eslint/no-confusing-void-expression': 'off', // Conflicto con pipes
    },
  },

  // ==================== CONFIGURACIÓN PARA TEST FILES ====================
  {
    files: ['**/*.spec.ts', '**/*.e2e-spec.ts', '**/*.test.ts'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      'max-lines-per-function': 'off',
    },
  },
);
