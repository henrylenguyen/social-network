// packages/prettier-config/index.js
module.exports = {
  semi: false,
  singleQuote: true,
  trailingComma: 'all',
  printWidth: 100,
  tabWidth: 2,
  useTabs: false,
  endOfLine: 'auto',
  bracketSpacing: true,
  arrowParens: 'avoid',
  plugins: [
    "./node_modules/prettier-plugin-svelte/plugin.js",
    "./node_modules/prettier-plugin-tailwindcss/dist/index.js",
  ].filter(plugin => {
    try {
      require.resolve(plugin);
      return true;
    } catch (e) {
      return false;
    }
  }),
  overrides: [
    {
      files: "*.svelte",
      options: {
        parser: "svelte"
      }
    }
  ]
}
