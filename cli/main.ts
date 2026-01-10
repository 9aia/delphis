import { createCLI } from '@bunli/core'
import pkg from '../package.json'
import helpCommand from './commands/help'
import joinCommand from './commands/join'
import postinstallCommand from './commands/postinstall'
import shareCommand from './commands/share'
import stopCommand from './commands/stop'
import versionCommand from './commands/version'
import { createLogger } from './lib/logger'

export const logger = createLogger()

const cli = await createCLI({
  name: pkg.name,
  version: pkg.version,
  description: pkg.description,
})

// Register commands
cli.command(helpCommand)
cli.command(versionCommand)
cli.command(joinCommand)
cli.command(shareCommand)
cli.command(stopCommand)
cli.command(postinstallCommand)

await cli.run()
