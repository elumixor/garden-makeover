import eslint from "@eslint/js";
import tseslint from "typescript-eslint";

export default tseslint.config(eslint.configs.recommended, tseslint.configs.recommendedTypeChecked, {
  files: ["src/**/*.ts"],
  languageOptions: {
    parserOptions: {
      projectService: true,
      tsconfigRootDir: import.meta.dirname,
    },
  },
  rules: {
    "no-console": "error",
    "@typescript-eslint/prefer-readonly": "error",
    "no-useless-rename": "error",
    "@typescript-eslint/consistent-type-definitions": ["error", "interface"],
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
