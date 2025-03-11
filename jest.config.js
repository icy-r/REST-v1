export default {
  testEnvironment: "node",
  testMatch: [
    "**/tests/**/*.test.js",
    "**/tests/unit/**/*.test.js",
    "**/tests/integration/**/*.test.js",
  ],
  testPathIgnorePatterns: [
    "<rootDir>/tests/security.test.js",
    "<rootDir>/tests/performance.test.js",
  ],
  collectCoverage: true,
  coverageDirectory: "coverage",
  coverageReporters: ["text", "lcov"],
  testTimeout: 30000,
};
