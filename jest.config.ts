import type { Config } from '@jest/types'

const jestConfig: Config.InitialOptions = {
  clearMocks: true,
  collectCoverage: true,
  coverageDirectory: 'coverage',
  testPathIgnorePatterns: ['/node_modules/'],
  preset: 'ts-jest',
}

export default jestConfig
