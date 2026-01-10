import { defineCommand } from '@bunli/core'
import { intro, log, outro } from '@clack/prompts'
import c from 'chalk'
import pkg from '../../package.json'
import { CodeRemotePasswordWithoutUsernameError, openRemoteCode } from '../lib/code-remote'
import { isBinaryInstalled } from '../lib/os'
import { isTailscaleUp } from '../lib/tailscale'

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
