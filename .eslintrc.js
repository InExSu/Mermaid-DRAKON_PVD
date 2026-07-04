**File: .eslintrc.js**

```js
module.exports = {
  root: true,
  env: {
    node: true,
    es2021: true,
    jest: true,
  },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: tsconfig.json,
    tsconfigRootDir: __dirname,
  },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:tseslint/recommended',
  ],
  rules: {
    // Team preferences
    'quotes': [2, 'single', { avoidEscape: true }],
    'semi': [2, 'always'],
    'no-console': 'off',
    'no-var': 'error',
    'prefer-const': 'error',

    // @typescript-eslint rules
    '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/no-empty-function': 'warn',
    '@typescript-eslint/no-non-null-assertion': 'warn',
    '@typescript-eslint/no-non-default-export': 'error',
    '@typescript-eslint/no-var-requires': 'error',
  },
};
```

**ESLint Configuration Explanation:**
1. Uses `@typescript-eslint/parser` to parse TypeScript
2. Extends recommended rules from both ESLint and TypeScript ESLint
3. Includes core rules that are commonly used
4. Configured for TypeScript projects with the proper project path

**To make this work properly, I need to:**

1. Create/update `.eslintrc.js` with proper configuration
2. Ensure the parser config points to the correct tsconfig.json
3. Make sure all required dependencies are installed