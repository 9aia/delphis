import { defineCommand } from '@bunli/core'
import { CodeRemotePasswordWithoutUsernameError, openRemoteCode } from '../lib/code-remote'
import { isTailscaleInstalled, isTailscaleUp } from '../lib/tailscale'
import { logger } from '../main'

export default defineCommand({
  name: 'join',
  description: 'Join a remote development environment',
  handler: async ({ positional }) => {
    const tailscaleInstalled = await isTailscaleInstalled()

    if (!tailscaleInstalled) {
      logger.error('Tailscale is not installed. Please install Tailscale and try again.')
      return
    }

    const tailscaleUp = await isTailscaleUp()

    if (!tailscaleUp) {
      logger.error('Tailscale is not up. Please start Tailscale and try again.')
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
        logger.warn(error.message)
      }
      else {
        throw error
      }
    }
  },
})
