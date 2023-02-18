// http://eslint.org/docs/user-guide/configuring

module.exports = {
  env: {
    browser: true, // 预定义的全局变量，这里是浏览器环境
    es6: true,
    node: true,
  },
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint', 'prettier'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:prettier/recommended',
  ],
  globals: {
    __PROD__: 'readonly',
  },
  ignorePatterns: ['node_modules/**/*', '**/dist/**/*', 'document/**/*'],
  rules: {
    'prettier/prettier': [2],
    semi: ['error', 'always'],
    quotes: [1, 'single'],
    'no-restricted-globals': [0],
    'import/first': [0],
    'import/no-anonymous-default-export': 'off',
    'prefer-promise-reject-errors': [0],
    'standard/no-callback-literal': [0], // 允许在callback中使用所有类型参数
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/ban-ts-comment': 'off',
    '@typescript-eslint/no-empty-function': [0],
    '@typescript-eslint/no-explicit-any': [0],
    '@typescript-eslint/no-var-requires': [0],
    '@typescript-eslint/no-unused-vars': 'off',
    '@typescript-eslint/no-empty-interface': 'off',
    '@typescript-eslint/ban-types': [0],
    '@typescript-eslint/no-namespace': [0],
    'no-inner-declarations': [0],
  },
};
