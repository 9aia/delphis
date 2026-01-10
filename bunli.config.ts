import { defineConfig } from '@bunli/core'
import pkg from './package.json'

export default defineConfig({
  name: pkg.name,
  version: pkg.version,
  description: pkg.description,

  commands: {
    directory: './cli/commands',
  },

  build: {
    entry: './cli/main.ts',
    outdir: './dist',
    targets: ['native'],
    minify: true,
    sourcemap: true,
    compress: false,
  },

  dev: {
    watch: true,
    inspect: true,
  },

  test: {
    pattern: ['./tests/**/*.test.ts'],
    coverage: true,
    watch: false,
  },

  plugins: [],
})
