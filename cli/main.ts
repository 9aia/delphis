import process from 'node:process'
import { Builtins, Cli } from 'clipanion'
import pkg from '../package.json'
import { HelpCommand } from './commands/help'
import { JoinCommand } from './commands/join'
import { ShareCommand } from './commands/share'
import { StopCommand } from './commands/stop'

process.on('SIGINT', () => {
  process.stdout.write('\n\n')
  process.exit()
})

const cli = new Cli({
  binaryName: 'delphis',
  binaryLabel: 'Delphis',
  binaryVersion: pkg.version,
})
cli.register(HelpCommand)
cli.register(JoinCommand)
cli.register(ShareCommand)
cli.register(StopCommand)
cli.register(Builtins.HelpCommand)
cli.register(Builtins.VersionCommand)
cli.runExit(process.argv.slice(2))
