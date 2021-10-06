module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    expand: true,
    verbose: true,
    testMatch: ['**/*.it.ts'],
    // This Jest setup doesn't expose a report, since we'd need to implement result merging from multiple runs.
    // testResultsProcessor: 'jest-sonar-reporter',
};

process.env = Object.assign(process.env, { DB_IS_STANDARD_DRIVER: 'true' });
