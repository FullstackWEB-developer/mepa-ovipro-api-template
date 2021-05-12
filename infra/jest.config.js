module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    expand: true,
    verbose: true,
    testMatch: ['**/*.test.ts'],
    collectCoverage: true,
    collectCoverageFrom: ['**/*.(tsx|ts)'],
    testResultsProcessor: 'jest-sonar-reporter',
};
