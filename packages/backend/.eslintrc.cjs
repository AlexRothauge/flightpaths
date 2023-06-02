module.exports = {
  root: true,
  env: {
    es2021: true,
    node: true,
  },
  extends: [
    "standard",
    "eslint:recommended",
    "plugin:@typescript-eslint/eslint-recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:@typescript-eslint/recommended-requiring-type-checking",
    "plugin:@typescript-eslint/strict",
    "prettier",
  ],
  parserOptions: {
    ecmaVersion: "latest",
    project: "./tsconfig.json",
  },
  reportUnusedDisableDirectives: true,
  ignorePatterns: ["src/api/routes/openapi/*"],
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
