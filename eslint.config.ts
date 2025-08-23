import eslint from "@eslint/js";
import tseslint from "typescript-eslint";
import stylistic from "@stylistic/eslint-plugin";

export default tseslint.config(eslint.configs.recommended, tseslint.configs.recommendedTypeChecked, {
  files: ["src/**/*.ts"],
  languageOptions: {
    parserOptions: {
      projectService: true,
      tsconfigRootDir: import.meta.dirname,
    },
  },
  plugins: {
    "@stylistic": stylistic,
  },
  rules: {
    "no-console": "error",
    "@typescript-eslint/prefer-readonly": "error",
    "no-useless-rename": "error",
    "@typescript-eslint/consistent-type-definitions": ["error", "interface"],
    "@typescript-eslint/no-unnecessary-template-expression": "error",
    "@stylistic/quotes": ["error", "double"],
    "@typescript-eslint/naming-convention": [
      "error",
      {
        selector: "interface",
        format: ["PascalCase"],
        custom: {
          regex: "^I[A-Z]",
          match: true,
        },
      },
    ],
    "no-duplicate-imports": "error",
    // Disallow explicit 'public' keyword
    "@typescript-eslint/explicit-member-accessibility": [
      "warn",
      {
        accessibility: "no-public",
      },
    ],
    // Require blank line between class members (including methods)
    "lines-between-class-members": ["warn", "always", { exceptAfterSingleLine: true }],
  },
});
