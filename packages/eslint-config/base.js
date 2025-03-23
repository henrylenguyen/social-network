module.exports = {
  extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended', 'prettier'],
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  env: {
    node: true,
    browser: true,
    es2021: true,
  },
  parserOptions: {
    ecmaVersion: 2021,
    sourceType: 'module',
  },
  rules: {
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    'no-console': ['warn', { allow: ['warn', 'error', 'info'] }],
    semi: ['error', 'never'], // Thêm quy tắc này để cấm dấu chấm phẩy
    '@typescript-eslint/semi': ['error', 'never'], // Thêm cho TypeScript
  },
  ignorePatterns: ['node_modules/', 'dist/', 'build/', 'coverage/', '**/*.d.ts'],
}
