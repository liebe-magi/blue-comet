// eslint.config.js
import js from '@eslint/js';
import typescriptPlugin from '@typescript-eslint/eslint-plugin';
import typescriptParser from '@typescript-eslint/parser';
import prettier from 'eslint-config-prettier';
import prettierPlugin from 'eslint-plugin-prettier';
import reactPlugin from 'eslint-plugin-react';
import reactHooksPlugin from 'eslint-plugin-react-hooks';

export default [
  // 基本設定（ESLintの推奨設定からスタート）
  js.configs.recommended,

  // プロジェクト全体の設定
  {
    ignores: ['dist/**', 'node_modules/**', 'example/dist/**', 'example/node_modules/**'],
    linterOptions: {
      reportUnusedDisableDirectives: true,
    },
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        // ブラウザ環境のグローバルオブジェクト
        document: 'readonly',
        navigator: 'readonly',
        window: 'readonly',
        console: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        setInterval: 'readonly',
        clearInterval: 'readonly',
      },
    },
    // 全ファイルに適用する共通ルール
    rules: {
      indent: ['error', 2, { SwitchCase: 1 }],
      quotes: ['error', 'single', { avoidEscape: true }],
      semi: ['error', 'always'],
      'no-console': 'warn', // consoleは警告に留める
      'no-unused-vars': 'off',
      'prettier/prettier': 'error',
    },
    plugins: {
      prettier: prettierPlugin,
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
  },

  // TypeScript用の設定
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        // projectの代わりにprojectServiceを使用
        // これによりプロジェクトリファレンスを持つTSConfigファイルをサポート
        projectService: true,
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    plugins: {
      '@typescript-eslint': typescriptPlugin,
    },
    rules: {
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-explicit-any': 'warn', // anyは警告に留める
    },
  },

  // React用の設定
  {
    files: ['**/*.jsx', '**/*.tsx'],
    plugins: {
      react: reactPlugin,
      'react-hooks': reactHooksPlugin,
    },
    rules: {
      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'off',
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
    },
  },

  // ExampleディレクトリのTypeScript設定
  {
    files: ['example/**/*.ts', 'example/**/*.tsx'],
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        // projectの代わりにprojectServiceを使用
        // これによりプロジェクトリファレンスを持つTSConfigファイルをサポート
        projectService: true,
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
  },

  // Prettierの設定を適用
  prettier,
];
