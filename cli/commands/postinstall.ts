import { exec } from 'node:child_process'
import { promisify } from 'node:util'
import { defineCommand } from '@bunli/core'
import { logger } from '../main'

const execAsync = promisify(exec)

export default defineCommand({
  name: 'postinstall',
  description: 'Run postinstall command',
  handler: async () => {
    logger.info('Running postinstall command')
    logger.info('Configuring git hooks')

    try {
      // TODO: handle cases where the user already has existing git hooks
      await execAsync('git config core.hooksPath ./node_modules/delphis/.githooks')
      logger.info('Git hooks successfully configured.')
    }
    catch (error) {
      logger.error(`Failed to configure git hooks: ${error instanceof Error ? error.message : String(error)}`)
    }
  },
})
