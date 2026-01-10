import process from 'node:process'
import { defineCommand } from '@bunli/core'
import { logger } from '../main'

export default defineCommand({
  name: 'stop',
  description: 'Stop a remote development environment',
  handler: async () => {
    logger.info('Stopping Delphis...')

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
      throw new Error('docker stop failed')
    }
  },
})
