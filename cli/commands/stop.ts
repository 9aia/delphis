import process from 'node:process'
import { defineCommand } from '@bunli/core'
import { intro, log, outro } from '@clack/prompts'
import c from 'chalk'
import pkg from '../../package.json'

export default defineCommand({
  name: 'stop',
  description: 'Stop a remote development environment',
  handler: async () => {
    intro(c.inverse(pkg.name))

    log.info('Stopping Delphis...')

    const args = ['docker', 'stop', 'delphis']

    const proc = Bun.spawn(args, {
      cwd: process.cwd(),
      stdout: 'inherit',
      stderr: 'inherit',
    })

    const rmArgs = ['docker', 'rm', '-f', 'delphis']

    const rmProc = Bun.spawn(rmArgs, {
      cwd: process.cwd(),
      stdout: 'ignore',
      stderr: 'ignore',
    })

    await rmProc.exited

    const exitCode = await proc.exited
    if (exitCode !== 0) {
      log.error('Failed to stop Delphis. Please try again.')
      process.exit(1)
    }

    outro(c.green('Delphis has been stopped.'))
  },
})
