import { Command } from 'clipanion'
import { BaseCommand } from '../lib/clipanion'

export class HelpCommand extends BaseCommand {
  static override paths = [['help']]

  static override usage = Command.Usage({
    description: 'Show help information',
    details: 'Display help information for the Strigi CLI tool.',
  })

  async execute() {
    // Execute the built-in help command by running the CLI with -h flag
    this.cli.run(['-h'])
  }
}
