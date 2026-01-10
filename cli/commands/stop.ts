import { Command } from 'clipanion'
import { BaseCommand } from '../lib/clipanion'

export class StopCommand extends BaseCommand {
  static override paths = [['stop']]

  static override usage = Command.Usage({
    description: 'Stop a remote development environment',
    details: 'Stop a remote development environment using Tailscale and VS Code.',
  })

  async execute() {
    // run: docker stop delphis
    this.context.stdout.write(`Stopping Delphis...\n`)
  }
}
