import process from 'node:process'
import { Command, Option } from 'clipanion'
import { BaseCommand } from '../lib/clipanion'

export class StopCommand extends BaseCommand {
  static override paths = [['stop']]

  static override usage = Command.Usage({
    description: 'Stop a remote development environment',
    details: 'Stop a remote development environment using Tailscale and VS Code.',
  })

  detach = Option.Boolean('-d,--detach', false)
  readonly = Option.Boolean('-r,--readonly', false)

  async execute() {
    this.context.stdout.write('Stopping Delphis...\n')

    const args = ['docker', 'stop', 'delphis']

    const proc = Bun.spawn(args, {
      cwd: process.cwd(),
      stdout: 'inherit',
      stderr: 'inherit',
      detached: true,
    })

    const rmArgs = ['docker', 'rm', '-f', 'delphis']

    const rmProc = Bun.spawn(rmArgs, {
      cwd: process.cwd(),
      stdout: 'ignore',
      stderr: 'ignore',
      detached: true,
    })

    await rmProc.exited

    const exitCode = await proc.exited
    if (exitCode !== 0) {
      throw new Error('docker stop failed')
    }
  }
}
