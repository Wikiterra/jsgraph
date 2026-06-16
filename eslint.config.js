import js from "@eslint/js";
import tseslint from "typescript-eslint";

export default tseslint.config(
  {
    // Third-party wabis framework and the apps' legacy code are out of scope for
    // linting — they are imported as-is and modernized gradually (see Phase 3+).
    ignores: [
      "**/dist/**",
      "**/node_modules/**",
      "packages/jsgraph-vendor/**",
      "apps/**/vendor/**",
      "apps/**/assets/**",
      "apps/**/app/**",
      "apps/**/js/**",
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
);
