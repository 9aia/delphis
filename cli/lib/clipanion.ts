import c from 'chalk-template'
import { Command } from 'clipanion'

export abstract class BaseCommand extends Command {
  async catch(error: any): Promise<void> {
    this.context.stdout.write(c`{red Error: ${error.message}}\n`)
  }
}
