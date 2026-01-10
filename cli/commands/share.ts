import { Option } from 'clipanion'
import { BaseCommand } from '../lib/clipanion'

export class ShareCommand extends BaseCommand {
  detach = Option.Boolean('-d,--detach', false)
  readonly = Option.Boolean('-r,--readonly', false)

  async execute() {
    // run: docker exec delphis
    this.context.stdout.write(`Sharing Delphis...\n`)
  }
}
