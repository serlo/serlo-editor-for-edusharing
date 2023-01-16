import type { Config } from '@jest/types'

const jestConfig: Config.InitialOptions = {
  clearMocks: true,
  testPathIgnorePatterns: ['/node_modules/'],
  preset: 'ts-jest/presets/default-esm',
  setupFiles: ['<rootDir>/jest.setupFiles.ts'],
}

export default jestConfig
