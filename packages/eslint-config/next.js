module.exports = {
  extends: ['plugin:react/recommended', './base.js', 'next/core-web-vitals'],
  plugins: ['react', 'jsx-a11y'],
  settings: {
    react: {
      version: 'detect',
    },
  },
  rules: {
    'react/react-in-jsx-scope': 'off',
    'react/prop-types': 'off',
    'jsx-a11y/anchor-is-valid': 'warn',
  },
}
