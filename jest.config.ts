module.exports = {
  testEnvironment: 'node',
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
  testRegex: '\\.test\\.ts$',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'json'],
  globals: {
    'ts-jest': {
      diagnostics: true,
      tsconfig: 'tsconfig.json',
    },
  },
  moduleNameMapper: {
    '^~/(.*)$': '<rootDir>/src/$1',
  },
  setupFiles: ['dotenv/config'],
};
