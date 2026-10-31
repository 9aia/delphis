#!/usr/bin/env bun
import { createCli, executeCli } from 'cheloni'
import { standardPlugin } from 'cheloni/plugins'
import { crashOnError } from '@/shared/lib/neverthrow'
import pkg from '../package.json'
import manifest from './manifest'

crashOnError(async () => {
  const cli = await createCli({
    name: pkg.name,
    version: pkg.version,
    description: pkg.description,
    command: manifest,
    plugin: standardPlugin,
  })

  await executeCli({ cli })
})
