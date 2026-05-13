/** @type {import('jest').Config} */
export default {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': '<rootDir>/src/__mocks__/styleMock.ts',
    '^../env$': '<rootDir>/src/__mocks__/env.ts',
    '^./env$': '<rootDir>/src/__mocks__/env.ts',
  },
  transform: {
    '^.+\\.tsx?$': ['ts-jest', {
      tsconfig: {
        jsx: 'react-jsx',
        esModuleInterop: true,
      },
      diagnostics: {
        ignoreCodes: [1343, 2339],
      },
    }],
  },
};
