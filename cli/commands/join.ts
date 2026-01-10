import { Option } from 'clipanion'
import { BaseCommand } from '../lib/clipanion'

export class JoinCommand extends BaseCommand {
  codeCommand = Option.Rest()

  async execute() {
    this.context.stdout.write(`${this.codeCommand.join(' ')}!\n`)
  }
}
