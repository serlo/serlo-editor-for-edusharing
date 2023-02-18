import * as esbuild from 'esbuild'

await esbuild.build({
  entryPoints: ['src/backend/server.ts'],
  // Workaround for bug https://github.com/evanw/esbuild/issues/1921
  // TODO: Delete it when it is not needed any more
  banner: {
    js: "import { createRequire } from 'module';const require = createRequire(import.meta.url);",
  },
  define: {
    'process.env.NODE_ENV': '"production"',
  },
  bundle: true,
  platform: 'node',
  format: 'esm',
  target: 'node18',
  external: ['next', '@next/env', 'mongoose'],
  outfile: 'dist/server.js',
})
