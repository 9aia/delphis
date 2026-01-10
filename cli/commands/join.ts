import { Command, Option } from 'clipanion'
import { BaseCommand } from '../lib/clipanion'
import { CodeRemotePasswordWithoutUsernameError, openRemoteCode } from '../lib/code-remote'
import { isTailscaleInstalled, isTailscaleUp } from '../lib/tailscale'

export class JoinCommand extends BaseCommand {
  static override paths = [['join']]

  static override usage = Command.Usage({
    description: 'Join a remote development environment',
    details: 'Join a remote development environment using Tailscale and VS Code.',
  })

  codeArgs = Option.Rest()

  async execute() {
    const tailscaleInstalled = await isTailscaleInstalled()

    if (!tailscaleInstalled) {
      this.logger.error('Tailscale is not installed. Please install Tailscale and try again.')
    }

    const tailscaleUp = await isTailscaleUp()

    if (!tailscaleUp) {
      this.logger.error('Tailscale is not up. Please start Tailscale and try again.')
    }

    // TODO: discover the host on tailnet. they will have the port listening

    const host = 'localhost'

    try {
      openRemoteCode({
        host,
        codeArgs: this.codeArgs,
      })
    }
    catch (error) {
      if (error instanceof CodeRemotePasswordWithoutUsernameError) {
        this.logger.warn(error.message)
      }
    }
  }
}
