import nextJest from "next/jest";

const createJestConfig = nextJest({
  dir: "./",
});

const config = {
  testEnvironment: "jest-environment-jsdom",

  setupFilesAfterEnv: ["<rootDir>/setupJest.ts"],

  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },

  // Temporarily only components will be tested
  collectCoverageFrom: [
    "src/components/**/*.{ts,tsx}",
    "!src/components/auth/**",
    "!src/**/*.spec.{ts,tsx}",
    "!src/**/*.test.{ts,tsx}",
    "!src/app/**",
    "!src/ui/**",
    "!src/components/ui/**",
    "!src/**/index.{ts,tsx}",
    "!src/**/*.d.ts",
  ],

  coverageDirectory: "coverage",
  coverageProvider: "v8",

  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },

  clearMocks: true,
};

export default createJestConfig(config);
