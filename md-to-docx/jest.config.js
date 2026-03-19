module.exports = {
  testEnvironment: "node",
  transform: {},
  coverageProvider: "v8",
  collectCoverageFrom: [
    "**/*.js",
    "!**/node_modules/**",
    "!**/tests/**",
    "!jest.config.js",
  ],
};
