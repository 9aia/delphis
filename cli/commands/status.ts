import process from 'node:process'
import { defineCommand } from '@bunli/core'
import { log, outro } from '@clack/prompts'
import c from 'chalk'
import { result } from '@/shared/lib/neverthrow'
import { getContainer } from '../docker'
import { dockerHandler } from '../handlers/docker'

export default defineCommand({
  name: 'status',
  description: 'Check if Delphis is running',
  handler: dockerHandler(async () => {
    const containerResult = await getContainer({ createIfNotExists: false })

    if (!containerResult.isOk()) {
      log.error(`Failed to get Delphis container: ${containerResult.error}`)
      process.exit(1)
    }

    const container = containerResult.value

    if (!container) {
      log.info('Delphis container does not exist.')
      outro(c.yellow('Status: Not running'))
      return
    }

    const inspectResult = await result(() => container.inspect())

    if (inspectResult.isErr()) {
      const error = inspectResult.error

      log.error(`Failed to inspect Delphis container: ${error}`)
      process.exit(1)
    }

    const info = inspectResult.value

    if (info.State.Running) {
      log.info('Delphis container is running.')
      outro(c.green('Status: Running'))
      return
    }

    log.info('Delphis container exists but is not running.')
    outro(c.yellow('Status: Stopped'))
  }),
})
