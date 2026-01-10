import os from 'node:os'
import process from 'node:process'
import { defineCommand, option } from '@bunli/core'
import { z } from 'zod'
import { logger } from '../main'

export default defineCommand({
  name: 'share',
  description: 'Share a remote development environment',
  options: {
    detach: option(
      z.coerce.boolean().default(false),
      { description: 'Run in detached mode', short: 'd' },
    ),
    readonly: option(
      z.coerce.boolean().default(false),
      { description: 'Run in readonly mode', short: 'r' },
    ),
  },
  handler: async ({ flags }) => {
    logger.info('Sharing Delphis...')

    // TODO: implement readonly mode

    const args = ['docker', 'run', '-d']
    args.push(
      '--name',
      'delphis',
      '--network',
      'host',
      '-e',
      `USER=${process.env.DELPHIS_USER}`,
      '-e',
      `PASSWORD=${process.env.DELPHIS_PASSWORD}`,
      '-v',
      `${os.homedir()}/.gitconfig:/home/${process.env.DELPHIS_USER}/.gitconfig:ro`,
      '-v',
      `${process.cwd()}:/delphis`,
      'delphis',
    )

    const proc = Bun.spawn(args, {
      cwd: process.cwd(),
      stdout: 'inherit',
      stderr: 'inherit',
      detached: flags.detach,
    })

    const exitCode = await proc.exited

    if (exitCode !== 0) {
      throw new Error('docker run failed')
    }
  },
})
