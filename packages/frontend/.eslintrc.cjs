/* eslint-env node */
require("@rushstack/eslint-patch/modern-module-resolution");

module.exports = {
  root: true,
  env: {
    es2021: true,
    node: true,
  },
  extends: [
    "plugin:vue/vue3-essential",
    "standard",
    "eslint:recommended",
    "plugin:@typescript-eslint/eslint-recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:@typescript-eslint/recommended-requiring-type-checking",
    "plugin:@typescript-eslint/strict",
    "prettier",
    "plugin:promise/recommended",
    "@vue/eslint-config-typescript/recommended",
    "@vue/eslint-config-prettier",
  ],
  overrides: [
    {
      files: ["cypress/e2e/**/*", "cypress/support/**/*"],
      extends: ["plugin:cypress/recommended"],
      parserOptions: {
        project: "cypress/e2e/tsconfig.json",
      },
    },
    {
      files: ["src/**/__tests__/*"],
      parserOptions: {
        project: "tsconfig.vitest.json",
      },
    },
    {
      files: ["vite.config.*", "vitest.config.*", "cypress.config.*", "playwright.config.*"],
      parserOptions: {
        project: "tsconfig.config.json",
      },
    },
  ],
  parserOptions: {
    ecmaVersion: "latest",
    project: "tsconfig.app.json",
  },
  reportUnusedDisableDirectives: true,
  rules: {
    "@typescript-eslint/array-type": [
      "warn",
      {
        default: "array-simple",
      },
    ],
    "@typescript-eslint/consistent-type-imports": [
      "error",
      {
        prefer: "type-imports",
        disallowTypeAnnotations: true,
        fixStyle: "separate-type-imports",
      },
    ],
    "@typescript-eslint/explicit-function-return-type": "error",
    "@typescript-eslint/explicit-module-boundary-types": "error",
    "@typescript-eslint/no-explicit-any": "error",
    "@typescript-eslint/no-implicit-any-catch": "error",
    "@typescript-eslint/no-use-before-define": "error",
    "consistent-return": "error",
    "no-await-in-loop": "error",
    "no-implicit-coercion": "error",
    "no-use-before-define": "off",
    "no-void": ["error", { allowAsStatement: true }],
  },
};
