import process from 'node:process'
import { defineCommand } from '@bunli/core'
import { log, outro } from '@clack/prompts'
import c from 'chalk'
import { result } from '@/shared/lib/neverthrow'
import { getContainer } from '../docker'
import { dockerHandler } from '../handlers/docker'

export default defineCommand({
  name: 'share',
  description: 'Share a remote development environment',
  handler: dockerHandler(async () => {
    const containerResult = await getContainer({ createIfNotExists: true })

    if (!containerResult.isOk()) {
      log.error(`Failed to get Delphis container: ${containerResult.error}`)
      process.exit(1)
    }

    const container = containerResult.value!

    const inspectResult = await result(() => container.inspect())

    if (inspectResult.isErr()) {
      const error = inspectResult.error
      log.error(`Failed to inspect Delphis container: ${error}`)
      process.exit(1)
    }
    else {
      const info = inspectResult.value

      if (info.State.Running) {
        log.info('Delphis container is already running.')
        return
      }
    }

    log.info('Starting Delphis container...')

    const startResult = await result(() => container.start())

    if (startResult.isErr()) {
      log.error(`Failed to start Delphis container: ${startResult.error}`)
      process.exit(1)
    }

    outro(c.green('Delphis is now sharing your environment.'))
  }),
})
