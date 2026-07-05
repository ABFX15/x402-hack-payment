import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
  {
    rules: {
      // Short-circuit and ternary side effects (`ok && doThing()`,
      // `cond ? a() : b()`) are intentional idioms here, not dead expressions.
      "@typescript-eslint/no-unused-expressions": [
        "error",
        {
          allowShortCircuit: true,
          allowTernary: true,
          allowTaggedTemplates: true,
        },
      ],
      // Tracked ratchet: still surfaced, but not a merge blocker. Drive to zero
      // over time, starting with the money layer (lib/db.ts).
      "@typescript-eslint/no-explicit-any": "warn",
      // React Compiler experimental lints — advisory, frequently fire on
      // legitimate patterns. Keep visible as warnings; `rules-of-hooks` and
      // `exhaustive-deps` stay as-is (real correctness).
      "react-hooks/set-state-in-effect": "warn",
      "react-hooks/purity": "warn",
      "react-hooks/immutability": "warn",
      "react-hooks/preserve-manual-memoization": "warn",
      "react-hooks/static-components": "warn",
    },
  },
  {
    // Test files: chai-style assertions (`expect(x).to.be.true`) read as unused
    // expressions, and mocks/fixtures legitimately use `any`.
    files: ["**/__tests__/**", "**/*.test.ts", "**/*.test.tsx"],
    rules: {
      "@typescript-eslint/no-unused-expressions": "off",
      "@typescript-eslint/no-explicit-any": "off",
    },
  },
]);

export default eslintConfig;
