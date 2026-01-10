import { defineCommand } from '@bunli/core'

export default defineCommand({
  name: 'help',
  description: 'Show help information',
  handler: async ({ colors }) => {
    console.log(colors.green('Delphis CLI - Help'))
    console.log(colors.cyan('\nAvailable commands:'))
    console.log(`${colors.yellow('  help')}        Show help information`)
    console.log(`${colors.yellow('  version')}     Show version information`)
    console.log(`${colors.yellow('  join')}        Join a remote development environment`)
    console.log(`${colors.yellow('  share')}       Share a remote development environment`)
    console.log(`${colors.yellow('  stop')}        Stop a remote development environment`)
    console.log(`${colors.yellow('  postinstall')} Run postinstall command`)
    console.log(colors.cyan('\nUse --help with any command for more information.'))
  },
})
