import type { Config } from "jest";

const config: Config = {
  testEnvironment: "node",
  transform: {
    "^.+\\.ts$": [
      "ts-jest",
      {
        tsconfig: "tsconfig.json",
        diagnostics: false,
      },
    ],
  },
  moduleFileExtensions: ["ts", "js", "json", "node"],
  coverageProvider: "v8",
  collectCoverageFrom: [
    "**/*.ts",
    "!**/node_modules/**",
    "!dist/**",
    "!coverage/**",
    "!**/tests/**",
    "!**/*.d.ts",
    "!**/types.ts",
    "!jest.config.ts",
  ],
};

export default config;
