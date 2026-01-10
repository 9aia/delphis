import { Option } from 'clipanion'
import { BaseCommand } from '../lib/clipanion'

export class JoinCommand extends BaseCommand {
  name = Option.String()
  newWindow = Option.Boolean('-n,--new-window', false)

  async execute() {
    this.context.stdout.write(`Hello ${this.name}!\n`)
  }
}
