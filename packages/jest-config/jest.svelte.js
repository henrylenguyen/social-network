module.exports = {
  ...require('./jest-preset'),
  testEnvironment: 'jsdom',
  transform: {
    '^.+\\.svelte$': 'svelte-jester',
    '^.+\\.(js|jsx|ts|tsx)$': ['@swc/jest'],
  },
  moduleFileExtensions: ['svelte', 'ts', 'js', 'jsx', 'tsx', 'json'],
  moduleNameMapper: {
    ...require('./jest-preset').moduleNameMapper,
    '^@/(.*)$': '<rootDir>/src/$1',
  },
}
