module.exports = {
  testEnvironment: "node",
  transform: {},
  coverageProvider: "v8",
  collectCoverageFrom: [
    "**/*.js",
    "!**/node_modules/**",
    "!coverage/**",
    "!**/tests/**",
    "!jest.config.js",
  ],
};