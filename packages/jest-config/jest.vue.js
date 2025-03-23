module.exports = {
  ...require('./jest-preset'),
  testEnvironment: 'jsdom',
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': ['@swc/jest'],
    '^.+\\.vue$': '@vue/vue3-jest',
  },
  moduleFileExtensions: ['vue', 'ts', 'tsx', 'js', 'jsx', 'json'],
  moduleNameMapper: {
    ...require('./jest-preset').moduleNameMapper,
    '^@/(.*)$': '<rootDir>/src/$1',
  },
}
