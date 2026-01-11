import type { Agent } from '@/types/delphis/agent'
import dgram from 'node:dgram'
import { defineCommand } from '@bunli/core'
import { intro, log, outro, select, spinner } from '@clack/prompts'
import c from 'chalk'
import { onDiscoveryMessage, sendDiscoveryPackets } from '@/lib/mcd/socket'
import { CodeRemotePasswordWithoutUsernameError, openRemoteCode } from '../../lib/code-remote'
import { isBinaryInstalled } from '../../lib/os'
import { getTailscaleDevices, isTailscaleUp } from '../../lib/tailscale'
import pkg from '../../package.json'

const DISCOVERY_TIMEOUT_MS = 3000

export default defineCommand({
  name: 'join',
  description: 'Join a remote development environment',
  handler: async ({ positional }) => {
    intro(c.inverse(pkg.name))

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

    const spin = spinner()
    spin.start()

    const agents: Agent[] = []
    const socket = dgram.createSocket('udp4')

    sendDiscoveryPackets({
      socket,
      tailscaleDevices,
      onPacketSent: (device) => {
        spin.message(`Sent discovery packet to ${device.hostname}`)
      },
      onFinish: () => {
        spin.message('Discover packets sent. Waiting for agents to respond...')
      },
    })

    onDiscoveryMessage({
      socket,
      tailscaleDevices,
      onNewAgent: agent => agents.push(agent),
    })

    const onDiscoverTimeout = async () => {
      spin.clear()

      const firstAgent = agents[0]

      if (!firstAgent) {
        outro(c.yellow('No agents found. Please ensure that there are remote development environments available to join.'))

        socket.close()
        return
      }

      let host = firstAgent.ip

      if (agents.length > 1) {
        host = await select({
          message: 'Select a agent to join:',
          options: agents.map(agent => ({
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
    }

    setTimeout(async () => onDiscoverTimeout(), DISCOVERY_TIMEOUT_MS)
  },
})
