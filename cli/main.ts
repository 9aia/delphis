import process from 'node:process'
import { Cli } from 'clipanion'
import pkg from '../package.json'
import { JoinCommand } from './commands/join'

process.on('SIGINT', () => {
  process.stdout.write('\n\n')
  process.exit()
})

const cli = new Cli({
  binaryName: 'delphis',
  binaryLabel: 'Delphis',
  binaryVersion: pkg.version,
})
cli.register(JoinCommand)
cli.runExit(process.argv.slice(2))
