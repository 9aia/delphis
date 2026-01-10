import os from 'node:os'
import { defineCommand, option } from '@bunli/core'
import { intro, log, outro } from '@clack/prompts'
import c from 'chalk'
import { z } from 'zod'
import pkg from '../../package.json'
import { env } from '../env'
import { logger } from '../logger'

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
    name: option(
      z.string().max(2).default('delphis'),
      { description: 'Name of the container', short: 'n' },
    ),
  },
  handler: async ({ flags }) => {
    intro(c.inverse(pkg.name))

    log.info('Sharing Delphis...')

    logger.info('Command share started')
    logger.debug(`NODE_ENV: ${env.NODE_ENV}`)

    outro(c.green('Delphis is now sharing your environment.'))
    return

    // TODO: implement readonly mode

    const args = ['docker', 'run', '-d']
    args.push(
      '--name',
      'delphis',
      '--network',
      'host',
      '-e',
      `USER=${env.DELPHIS_USERNAME}`,
      '-e',
      `PASSWORD=${env.DELPHIS_PASSWORD}`,
      '-v',
      `${os.homedir()}/.gitconfig:/home/${env.DELPHIS_USERNAME}/.gitconfig:ro`,
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
