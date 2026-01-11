import { Buffer } from 'node:buffer'
import dgram from 'node:dgram'
import { defineCommand } from '@bunli/core'
import { intro, log, outro, progress } from '@clack/prompts'
import c from 'chalk'
import { sharedEnv } from '@/env/shared'
import { CodeRemotePasswordWithoutUsernameError, openRemoteCode } from '../../lib/code-remote'
import { isBinaryInstalled } from '../../lib/os'
import { getTailscaleDevices, isTailscaleUp } from '../../lib/tailscale'
import pkg from '../../package.json'

const PORT = sharedEnv.DELPHIS_PORT

export default defineCommand({
  name: 'join',
  description: 'Join a remote development environment',
  handler: async ({ positional }) => {
    intro(c.inverse(pkg.name))

    const tailscaleInstalled = await isBinaryInstalled('tailscale')

    if (!tailscaleInstalled) {
      log.error('Tailscale is not installed. Please install Tailscale and try again.')
      return
    }

    const tailscaleUp = await isTailscaleUp()

    if (!tailscaleUp) {
      log.error('Tailscale is not up. Please start Tailscale and try again.')
      return
    }

    const tailscaleDevices = await getTailscaleDevices()

    if (tailscaleDevices.length === 0) {
      log.error('No connected Tailscale devices found. Please ensure the devices are added to the tailnet.')
      return
    }

    const socket = dgram.createSocket('udp4')

    const prog = progress({
      style: 'heavy',
      max: tailscaleDevices.length,
      size: 0,
    })

    socket.bind(() => {
      prog.start('Discovering hosts on Tailscale network...')

      for (const device of tailscaleDevices) {
        if (!device.connectedToControl) {
          prog.advance(1)

          continue
        }

        if (device.addresses.includes(':'))
          continue

        for (const address of device.addresses) {
          if (address.includes(':'))
            continue

          socket.send(
            Buffer.from('DISCOVER_AGENTS'),
            PORT,
            address,
            (err) => {
              if (err) {
                console.error(`Failed to send to ${device.hostname} (${address}):`, err.message)
              }
            },
          )
        }

        prog.advance(1)
        break
      }
    })

    // TODO: discover the host on tailnet. they will have the port listening

    const host = 'localhost'

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
