#!/usr/bin/env bun
import { createCLI } from '@bunli/core'
import pkg from '../package.json'
import manifest from './manifest'

async function main() {
  const cli = await createCLI({
    name: pkg.name,
    version: pkg.version,
    description: pkg.description,
  })

  await cli.load(manifest)

  // Loads manifest if configured)
  await cli.init()

  await cli.run()
}

main()
