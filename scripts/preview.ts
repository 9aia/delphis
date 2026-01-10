#!/usr/bin/env bun
import process from 'node:process'
import pkg from '../package.json'

try {
  await Bun.$`${pkg.bin.delphis}`
}
catch (error) {
  console.error(`Failed to run preview: ${error instanceof Error ? error.message : String(error)}`)
  process.exit(1)
}
