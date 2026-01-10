#!/usr/bin/env bun
import process from 'node:process'
import { Generator } from '@bunli/generator'

const generator = new Generator({
  commandsDir: './cli/commands',
  outputFile: '.bunli/commands.gen.ts',
  generateReport: false,
})

try {
  console.log('Generating types...')

  // Generate types
  await generator.run()

  console.log('Types generated successfully.')
}
catch (error) {
  console.error(`Failed to generate types: ${error instanceof Error ? error.message : String(error)}`)
  process.exit(1)
}
