import type Docker from 'dockerode'
import process from 'node:process'
import { defineCommand, option } from '@bunli/core'
import { log, outro } from '@clack/prompts'
import c from 'chalk'
import z from 'zod'
import { result } from '@/shared/lib/neverthrow'
import { container } from '../docker'
import { dockerHandler } from '../handlers/docker'

export default defineCommand({
  name: 'unshare',
  description: 'Unshare your current development environment',
  options: {
    force: option(
      z.coerce.boolean().default(false),
      { description: 'Force stop the container', short: 'f' },
    ),
  },
  handler: dockerHandler(async () => {
    const inspectResult = await result(container.inspect)

    if (inspectResult.isErr()) {
      const error = inspectResult.error

      if (error === 'No such container') {
        log.error('Delphis container is not running, because it does not exist.')
        process.exit(1)
      }

      log.error(`Failed to inspect Delphis container: ${error}`)
      process.exit(1)
    }

    const info = inspectResult.value

    if (!info.State.Running) {
      log.info('Delphis container is already stopped.')
      process.exit(1)
    }

    log.info('Stopping Delphis container...')

    const stopResult = await result(container.stop)

    if (stopResult.isErr()) {
      log.error(`Failed to stop Delphis container: ${stopResult.error}`)
      process.exit(1)
    }

    outro(c.green('Delphis container has been stopped.'))
  }),
})
