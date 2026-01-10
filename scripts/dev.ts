#!/usr/bin/env bun
import process from 'node:process'
import mri from 'mri'

try {
  const argv = mri(process.argv.slice(2))
  const positional = argv._

  await Bun.$`bun run --watch ./cli/main.ts ${positional}`
}
catch (error) {
  console.error('Failed to start dev server:', error)
  process.exit(1)
}
