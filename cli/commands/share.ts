import process from 'node:process'
import { defineCommand, option } from '@bunli/core'
import { log, outro } from '@clack/prompts'
import c from 'chalk'
import { z } from 'zod'
import { result } from '@/shared/lib/neverthrow'
import { container } from '../docker'
import { dockerHandler } from '../handlers/docker'

export default defineCommand({
  name: 'share',
  description: 'Share a remote development environment',
  handler: dockerHandler(async () => {
    const inspectResult = await result(container.inspect)

    if (inspectResult.isErr()) {
      const error = inspectResult.error

      if (error !== 'No such container') {
        log.error(`Failed to inspect Delphis container: ${error}`)
        process.exit(1)
      }
    }
    else {
      const info = inspectResult.value

      if (info.State.Running) {
        log.info('Delphis container is already running.')
        return
      }
    }

    log.info('Starting Delphis container...')

    const startResult = await result(container.start)

    if (startResult.isErr()) {
      log.error(`Failed to start Delphis container: ${startResult.error}`)
      process.exit(1)
    }

    outro(c.green('Delphis is now sharing your environment.'))
  }),
})
