import { exec } from 'node:child_process'
import process from 'node:process'
import { promisify } from 'node:util'
import { defineCommand } from '@bunli/core'
import { intro, log, outro } from '@clack/prompts'
import c from 'chalk'
import pkg from '../../package.json'

const execAsync = promisify(exec)

export default defineCommand({
  name: 'postinstall',
  description: 'Run postinstall command',
  handler: async () => {
    intro(c.inverse(pkg.name))

    log.info('Running postinstall command')
    log.info('Configuring git hooks')

    try {
      // TODO: handle cases where the user already has existing git hooks
      await execAsync('git config core.hooksPath ./node_modules/delphis/.githooks')
    }
    catch (error) {
      log.error(`Failed to configure git hooks: ${error instanceof Error ? error.message : String(error)}`)
      process.exit(1)
    }

    outro(c.green('Git hooks successfully configured.'))
  },
})
