"use strict";
module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/src/$1',
    },
    testMatch: ['**/src/util/**/*.test.(ts|tsx)','**/src/commands/fts/SearchWorkbench/test/*.test.ts'],
    transform: {
        '^.+\\.(ts|tsx)$': 'ts-jest',
    },
};