export default {
  watch: false,
  testEnvironment: "node",
  testMatch: [
    "**/tests/**/*.test.js",
    "**/tests/unit/**/*.test.js",
    "**/tests/integration/**/*.test.js",
    "**/tests/rate-limit/**/*.test.js",
  ],
  testPathIgnorePatterns: [
    "<rootDir>/tests/security.test.js",
    "<rootDir>/tests/performance.test.js",
  ],
  //exclude the following files from from normal test runs but directly able to run them

  collectCoverage: true,
  coverageDirectory: "coverage",
  coverageReporters: ["text", "lcov"],
  testTimeout: 30000,
};
