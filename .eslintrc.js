/** @type {import('@typescript-eslint/utils/dist/ts-eslint').Linter.Config} */
module.exports = {
  env: {
    browser: true,
    commonjs: true,
    es2021: true,
  },
  extends: [
    '@spotify/eslint-config-base',
    '@spotify/eslint-config-typescript',
    'eslint:recommended',
    'plugin:@typescript-eslint/all',
    'plugin:import/recommended',
    'plugin:import/typescript',
    'plugin:jest/recommended',
    'plugin:prettier/recommended',
  ],
  ignorePatterns: [
    'node_modules/**/*',
  ],
  overrides: [
    {
      files: ['*.test.ts'],
      rules: {
        '@typescript-eslint/no-magic-numbers': 'off', // Allow magic numbers in tests
      },
    }
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2020,
    project: 'tsconfig.json',
  },
  rules: {
    '@typescript-eslint/init-declarations': 'off',
    '@typescript-eslint/no-empty-function': 'off', // empty functions are concise
    '@typescript-eslint/no-magic-numbers': ['error', { ignore: [0, 1] }], // 1, array[0] and array.length === 0 are idiomatic
    '@typescript-eslint/no-type-alias': 'off', // type aliases are useful
    '@typescript-eslint/prefer-readonly-parameter-types': 'off', // yields false positives in combination w/@typescript-eslint/no-parameter-properties
    'consistent-return': 'off',
    'default-case': 'off', // Use Typescript's exhaustive switch assertion instead
    'no-console': 'error',
    'import/order': [
      'error',
      {
        groups: ['builtin', 'external', 'internal', 'index', 'parent', 'sibling', 'object', 'type'],
        alphabetize: {
          order: 'asc',
          caseInsensitive: false,
        },
      },
    ],
  },
}
