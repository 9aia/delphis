import process from 'node:process'
import { log, outro, spinner } from '@clack/prompts'
import c from 'chalk'
import { defineCommand } from 'cheloni'
import { result } from '@/shared/lib/neverthrow'
import { getContainer } from '../docker'
import { dockerMiddleware } from '../middleware/docker'

export default defineCommand({
  name: 'unshare',
  description: 'Unshare your current development environment',
  middleware: dockerMiddleware,
  handler: async () => {
    const containerResult = await getContainer({ createIfNotExists: false })

    if (!containerResult.isOk()) {
      log.error(`Failed to get Delphis container: ${containerResult.error}`)
      process.exit(1)
    }

    const container = containerResult.value

    if (!container) {
      log.error('Delphis container is not running, because it does not exist.')
      process.exit(1)
    }

    const inspectResult = await result(() => container.inspect())

    if (inspectResult.isErr()) {
      const error = inspectResult.error

      log.error(`Failed to inspect Delphis container: ${error}`)
      process.exit(1)
    }

    const info = inspectResult.value

    if (!info.State.Running) {
      log.info('Delphis container is already stopped.')
      process.exit(1)
    }

    const s = spinner()
    s.start('Stopping Delphis container...')

    const stopResult = await result(() => container.stop())

    if (stopResult.isErr()) {
      log.error(`Failed to stop Delphis container: ${stopResult.error}`)
      process.exit(1)
    }

    s.stop('Success')

    outro(c.green('Delphis container has been stopped.'))
  },
})
