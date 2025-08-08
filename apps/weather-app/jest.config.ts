// jest.config.ts
import type { Config } from 'jest';

const config: Config = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: './src',
  testRegex: '.*\\.spec\\.ts$',
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
  moduleNameMapper: {
    '^src/(.*)$': '<rootDir>/src/$1',
    '^@app/common$': '<rootDir>/../../../libs/common/src/index.ts',
    '^@app/common/(.*)$': '<rootDir>/../../../libs/common/src/$1',
    '^@app/contracts$': '<rootDir>/../../../libs/contracts/events/index.ts',
    '^@app/contracts/(.*)$': '<rootDir>/../../../libs/contracts/events/$1',
  },
  testEnvironment: 'node',
  setupFiles: ['../../../configs/jest.setup.ts'],
};

export default config;
