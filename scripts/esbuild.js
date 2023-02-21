import { dirname } from 'path'
import { fileURLToPath } from 'url'
import { PHASE_PRODUCTION_SERVER } from 'next/dist/shared/lib/constants.js'
import nextLoadConfig from 'next/dist/server/config.js'
import { defaultImport } from 'default-import'
import * as esbuild from 'esbuild'

const projectDirectory = dirname(dirname(fileURLToPath(import.meta.url)))
const loadConfig = defaultImport(nextLoadConfig)
const nextConfig = await loadConfig(PHASE_PRODUCTION_SERVER, projectDirectory)

await esbuild.build({
  entryPoints: ['src/backend/server.ts'],
  // Workaround for bug https://github.com/evanw/esbuild/issues/1921
  // TODO: Delete it when it is not needed any more
  banner: {
    js: "import { createRequire } from 'module';const require = createRequire(import.meta.url);",
  },
  define: {
    'process.env.NODE_ENV': '"production"',
    'global.NEXT_CONFIG': JSON.stringify(nextConfig),
  },
  treeShaking: true,
  minifySyntax: true,
  bundle: true,
  platform: 'node',
  format: 'esm',
  target: 'node18',
  external: ['next', '@next/env', 'mongoose'],
  outfile: 'dist/server.js',
})
