import type { DelphisDiscoveryError, DiscoveryClient } from '@/lib/delphis-discovery'
import process from 'node:process'
import { defineCommand } from '@bunli/core'
import { intro, log, outro, select, spinner } from '@clack/prompts'
import c from 'chalk'
import { CodeRemotePasswordWithoutUsernameError, openRemoteCode } from '@/lib/code-remote'
import { createDiscoveryServer, DelphisDiscoveryTimeoutError } from '@/lib/delphis-discovery'
import { isBinaryInstalled } from '../../lib/os'
import { getTailscaleDevices, getTailscaleIp, isTailscaleUp } from '../../lib/tailscale'
import pkg from '../../package.json'
import { logger } from '../logger'

export default defineCommand({
  name: 'join',
  description: 'Join a remote development environment',
  handler: async ({ positional }) => {
    intro(c.inverse(pkg.name))

    const tailscaleIp = getTailscaleIp()

    if (!tailscaleIp) {
      log.error('No Tailscale IP address found. Please ensure Tailscale is running and try again.')
      return
    }

    const initPromises = [
      isBinaryInstalled('tailscale'),
      isTailscaleUp(),
      getTailscaleDevices(),
    ] as const

    const [tailscaleInstalled, tailscaleUp, tailscaleDevices] = await Promise.all(initPromises)

    if (!tailscaleInstalled) {
      log.error('Tailscale is not installed. Please install Tailscale and try again.')
      return
    }

    if (!tailscaleUp) {
      log.error('Tailscale is not up. Please start Tailscale and try again.')
      return
    }

    if (!tailscaleDevices.length) {
      log.error('No connected Tailscale devices found. Please ensure the devices are added to the tailnet.')
      return
    }

    const tailscaleDevicesToRequest = tailscaleDevices.filter(device => !device.addresses.includes(tailscaleIp))

    const spin = spinner()
    spin.start(c.blue('Discovering available remote development environments...'))

    const clients: DiscoveryClient[] = []
    const errors: DelphisDiscoveryError[] = []

    const discoveryTimeoutMs = 3000

    const server = createDiscoveryServer({
      tailscaleDevices: tailscaleDevicesToRequest,
      onError(error) {
        logger.error(error)
        spin.stop()
        spin.clear()
        log.error('Discovery server socket error. See Delphis logs for more details.')
        outro(c.red('Error. Please try again.'))
        process.exit(1)
      },
      onMessageError(error) {
        errors.push(error)
        logger.error(error)
      },
      onClientAvailable(client) {
        spin.message(c.green(`Found ${client.hostname} - ${client.os} - ${client.ip}`))
        clients.push(client)
      },
    })
    server.open()
    server.requestNetwork({
      timeout: discoveryTimeoutMs,
      onError: (error) => {
        if (error instanceof DelphisDiscoveryTimeoutError) {
          return
        }

        errors.push(error)
        logger.error(error)
      },
    })

    await new Promise(resolve => setTimeout(resolve, discoveryTimeoutMs + 250))

    server.close()

    spin.stop()
    spin.clear()

    if (errors.length) {
      log.error('Some errors occurred while discovering remote development environments. See Delphis logs for more details.')
    }

    const firstAgent = clients[0]

    if (!clients.length || !firstAgent) {
      outro(c.yellow('No agents found. Please ensure that there are remote development environments available to join.'))
      return
    }

    let host = firstAgent.ip

    if (clients.length > 1) {
      host = await select({
        message: 'Select a agent to join:',
        options: clients.map(agent => ({
          label: `${agent.hostname} - ${agent.os} - ${agent.ip}`,
          value: agent.ip,
        })),
      }) as string
    }

    const codeArgs = positional

    try {
      openRemoteCode({
        host,
        codeArgs,
      })
    }
    catch (error) {
      if (error instanceof CodeRemotePasswordWithoutUsernameError) {
        log.warn(error.message)
      }
      else {
        throw error
      }
    }

    outro(c.green('Joined the remote development environment.'))
  },
})
