import os from 'node:os'
import process from 'node:process'
import { Command, Option } from 'clipanion'
import { BaseCommand } from '../lib/clipanion'

export class ShareCommand extends BaseCommand {
  static override paths = [['share']]

  static override usage = Command.Usage({
    description: 'Share a remote development environment',
    details: 'Share a remote development environment using Tailscale and VS Code.',
  })

  detach = Option.Boolean('-d,--detach', false)
  readonly = Option.Boolean('-r,--readonly', false)

  async execute() {
    this.context.stdout.write('Sharing Delphis...\n')

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
      detached: true,
    })

    const exitCode = await proc.exited

    if (exitCode !== 0) {
      throw new Error('docker run failed')
    }
  }
}
