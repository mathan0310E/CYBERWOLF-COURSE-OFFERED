module.exports = {
  root: true,
  env: { browser: true, es2022: true, node: true },
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
  ],
  parser: "@typescript-eslint/parser",
  parserOptions: { ecmaVersion: "latest", sourceType: "module" },
  plugins: ["@typescript-eslint", "react-hooks", "react-refresh"],
  ignorePatterns: [
    "dist",
    "lib",
    "node_modules",
    "*.config.js",
    "*.config.ts",
    "scripts/*.mjs",
    "**/*.d.ts",
  ],
  rules: {
    "@typescript-eslint/no-explicit-any": "warn",
    "@typescript-eslint/no-unused-vars": [
      "error",
      { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
    ],
    "no-console": "off",
  },
  overrides: [
    {
      files: ["apps/**/*.{ts,tsx}"],
      plugins: ["react-hooks", "react-refresh"],
      rules: {
        "react-hooks/rules-of-hooks": "error",
        "react-hooks/exhaustive-deps": "warn",
      },
    },
  ],
};
