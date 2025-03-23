const baseConfig = require('@social-blog/storybook-config/main')

module.exports = {
  ...baseConfig,
  framework: {
    name: '@storybook/vue3-webpack5',
    options: {},
  },
}
