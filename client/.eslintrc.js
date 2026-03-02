module.exports = {
  env: {
    browser: true,
    es2021: true,
  },
  extends: ['airbnb-base'],
  parserOptions: {
    ecmaVersion: 2021,
    sourceType: 'module',
  },
  rules: {
    'no-console': 'warn',
    'import/extensions': 'off',
    'no-restricted-syntax': 'off',
    'no-param-reassign': ['error', { props: false }],
    'class-methods-use-this': 'off',
  },
};
