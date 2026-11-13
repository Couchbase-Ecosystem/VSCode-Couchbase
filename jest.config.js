"use strict";
module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/src/$1',
    },
    testMatch: ['**/src/**/*.test.(ts|tsx)'],
    // src/test holds the mocha suites that run inside VS Code (npm test)
    testPathIgnorePatterns: ['/node_modules/', '/src/test/', '/out/', '/dist/'],
    transform: {
        '^.+\\.(ts|tsx)$': 'ts-jest',
    },
};