const tseslint = require('typescript-eslint');
const pluginReact = require('eslint-plugin-react');
const pluginJsxA11y = require('eslint-plugin-jsx-a11y');
const pluginReactHooks = require('eslint-plugin-react-hooks');
const globals = require('globals');

module.exports = [
  {
    ignores: ['dist/**', 'build/**', 'coverage/**', 'docs/.next/**', 'docs/export/**'],
  },
  ...tseslint.configs.recommended.map((config) => ({
    ...config,
    files: ['**/*.{ts,tsx}'],
  })),
  {
    files: ['src/**/*.{js,jsx,ts,tsx}', 'examples/**/*.{js,jsx,ts,tsx}', 'test/**/*.{js,jsx,ts,tsx}', '*.{js,ts}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.mocha,
        ...globals.es2020,
      },
    },
    settings: {
      react: {
        version: '19.2.5',
      },
    },
    plugins: {
      react: pluginReact,
      'jsx-a11y': pluginJsxA11y,
      'react-hooks': pluginReactHooks,
    },
    rules: {
      ...pluginJsxA11y.configs.recommended.rules,
      'no-console': 'off',
      semi: 2,
      'no-tabs': 2,
      'react/self-closing-comp': 2,
      'react/no-typos': 2,
      'react/jsx-no-duplicate-props': 'warn',
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      'jsx-a11y/no-autofocus': [
        2,
        {
          ignoreNonDOM: true,
        },
      ],
    },
  },
];
