import { BaseCommand } from '../lib/clipanion'

export class StopCommand extends BaseCommand {
  async execute() {
    // run: docker stop delphis
    this.context.stdout.write(`Stopping Delphis...\n`)
  }
}
