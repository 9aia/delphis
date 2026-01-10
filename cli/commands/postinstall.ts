import { exec } from 'node:child_process'
import { promisify } from 'node:util'
import { Command } from 'clipanion'
import { BaseCommand } from '../lib/clipanion'

const execAsync = promisify(exec)

export class PostinstallCommand extends BaseCommand {
  static override paths = [['postinstall']]

  static override usage = Command.Usage({
    description: 'Run postinstall command',
    details: 'Run postinstall command to configure git hooks.',
  })

  async execute() {
    this.logger.info('Running postinstall command')
    this.logger.info('Configuring git hooks')

    try {
      // TODO: handle cases where the user already has existing git hooks
      await execAsync('git config core.hooksPath ./node_modules/delphis/.githooks')
      this.logger.info('Git hooks successfully configured.')
    }
    catch (error) {
      this.logger.error(`Failed to configure git hooks: ${error instanceof Error ? error.message : String(error)}`)
    }
  }
}
