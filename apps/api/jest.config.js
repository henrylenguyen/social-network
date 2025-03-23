module.exports = {
  preset: '@social-blog/jest-config/jest.node.js',
  rootDir: '.',
  coverageDirectory: './coverage',
  testRegex: '.*\\.spec\\.ts$',
  collectCoverageFrom: ['src/**/*.(t|j)s'],
}
