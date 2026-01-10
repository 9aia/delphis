import { Command, Option } from 'clipanion'
import { BaseCommand } from '../lib/clipanion'

export class ShareCommand extends BaseCommand {
  static override paths = [['share']]

  static override usage = Command.Usage({
    description: 'Share a remote development environment',
    details: 'Share a remote development environment using Tailscale and VS Code.',
  })

  detach = Option.Boolean('-d,--detach', false)
  readonly = Option.Boolean('-r,--readonly', false)

  async execute() {
    // run: docker exec delphis
    this.context.stdout.write(`Sharing Delphis...\n`)
  }
}
