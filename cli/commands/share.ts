import os from 'node:os'
import process from 'node:process'
import { defineCommand, option } from '@bunli/core'
import { intro, log, outro } from '@clack/prompts'
import c from 'chalk'
import { z } from 'zod'
import { sharedEnv } from '../../env/shared'
import { isBinaryInstalled } from '../../lib/os'
import pkg from '../../package.json'

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

    const dockerInstalled = await isBinaryInstalled('docker')

    if (!dockerInstalled) {
      log.error('Docker is not installed. Please install Docker and try again.')
      return
    }

    // TODO: implement readonly mode

    const args = ['docker', 'run', '-d']
    args.push(
      '--name',
      'delphis-mcd',
      '-p',
      '22444:22444/tcp',
      '-p',
      '22444:22444/udp',
      '-e',
      `USER=${sharedEnv.DELPHIS_USERNAME}`,
      '-e',
      `PASSWORD=${sharedEnv.DELPHIS_PASSWORD}`,
      '-v',
      `${os.homedir()}/.gitconfig:/home/${sharedEnv.DELPHIS_USERNAME}/.gitconfig:ro`,
      '-v',
      `${process.cwd()}:/delphis`,
      'delphis-mcd',
    )

    const proc = Bun.spawn(args, {
      cwd: process.cwd(),
      stdout: 'inherit',
      stderr: 'inherit',
      detached: flags.detach,
    })

    const exitCode = await proc.exited

    if (exitCode !== 0) {
      log.error('Failed to share Delphis. Please try again.')
      process.exit(1)
    }

    outro(c.green('Delphis is now sharing your environment.'))
  },
})
