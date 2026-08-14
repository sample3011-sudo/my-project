/** @type {import('jest').Config} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['<rootDir>/tests/**/*.test.ts'],
  collectCoverageFrom: [
    'src/services/**/*.ts',
    '!src/services/index.ts',
  ],
  coverageThreshold: {
    global: {
      lines: 80,
    },
  },
  moduleNameMapper: {
    '^@repo/shared$': '<rootDir>/../../packages/shared/src',
  },
};
