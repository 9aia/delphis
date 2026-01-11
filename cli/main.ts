#!/usr/bin/env bun
import { createCLI } from '@bunli/core'
import { crashOnError } from '@/shared/lib/neverthrow'
import pkg from '../package.json'
import manifest from './manifest'

crashOnError(async () => {
  const cli = await createCLI({
    name: pkg.name,
    version: pkg.version,
    description: pkg.description,
  })

  await cli.load(manifest)
  await cli.init()
  await cli.run()
})
