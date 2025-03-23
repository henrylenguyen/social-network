const baseConfig = require('@social-blog/storybook-config/main')

module.exports = {
  ...baseConfig,
  framework: {
    name: '@storybook/svelte-webpack5',
    options: {},
  },
}
