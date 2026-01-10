import { Option } from 'clipanion'
import { BaseCommand } from '../lib/clipanion'
import { getTailscaleIp, isTailscaleInstalled, isTailscaleUp } from '../lib/tailscale'

export class JoinCommand extends BaseCommand {
  name = Option.String()

  async execute() {
    this.context.stdout.write(`Hello ${this.name}!\n`)

    const tailscaleInstalled = await isTailscaleInstalled()

    if (!tailscaleInstalled) {
      this.logger.error('Tailscale is not installed. Please install Tailscale and try again.')
    }

    const tailscaleUp = await isTailscaleUp()

    if (!tailscaleUp) {
      this.logger.error('Tailscale is not up. Please start Tailscale and try again.')
    }

    const ip = getTailscaleIp()

    this.context.stdout.write(`Tailscale IP: ${ip}\n`)
  }
}
