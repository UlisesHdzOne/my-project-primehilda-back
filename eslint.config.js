// Flat ESLint config for ESLint v9+
// Ignores generated and build artifacts to keep Problems panel clean
import js from "@eslint/js";
import tseslint from "typescript-eslint";
import prettier from "eslint-config-prettier";

export default [
  {
    ignores: [
      "node_modules/**",
      "dist/**",
      "coverage/**",
      "generated/**",
      "**/generated/**",
      "prisma/generated/**",
      "**/*.d.ts"
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  prettier,
  {
    files: ["**/*.ts"],
    languageOptions: {
      parserOptions: {
        project: false,
        sourceType: "module",
        ecmaVersion: "latest",
      },
    },
    rules: {
      "@typescript-eslint/consistent-type-imports": "warn",
    },
  },
];
