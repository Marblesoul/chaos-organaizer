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
    // Private class members use _ prefix by convention
    'no-underscore-dangle': 'off',
    // Named exports are intentional (multiple exports per file)
    'import/prefer-default-export': 'off',
    // Template literals vs concatenation — minor style preference
    'prefer-template': 'off',
  },
};
