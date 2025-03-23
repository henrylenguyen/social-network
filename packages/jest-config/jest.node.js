module.exports = {
  ...require('./jest-preset'),
  testEnvironment: 'node',
  transform: {
    '^.+\\.(t|j)s$': ['@swc/jest'],
  },
  moduleNameMapper: {
    ...require('./jest-preset').moduleNameMapper,
    '^@/(.*)$': '<rootDir>/src/$1',
  },
}
