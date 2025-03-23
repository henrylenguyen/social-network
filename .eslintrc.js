module.exports = {
  root: true,
  extends: ['@social-blog/eslint-config/base'],
  ignorePatterns: ['node_modules', 'dist', 'build', 'coverage', '.next', '.nuxt'],
  settings: {
    next: {
      rootDir: ['apps/*/'],
    },
  },
}
