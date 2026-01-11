import type { Handler, HandlerArgs } from '@bunli/core'
import { intro, log } from '@clack/prompts'
import c from 'chalk'
import { isDockerDaemonRunning } from '../../lib/docker'
import { isBinaryInstalled } from '../../lib/os'
import pkg from '../../package.json'

export function dockerHandler<TFlags = Record<string, unknown>, TStore = {}, TCommandName extends string = string>(
  handler: (
    context: HandlerArgs<TFlags, TStore, TCommandName>,
  ) => Promise<void>,
): Handler<TFlags, TStore, TCommandName> {
  return async (context) => {
    intro(c.inverse(pkg.name))

    const dockerInstalled = await isBinaryInstalled('docker')

    if (!dockerInstalled) {
      log.error('Docker is not installed. Please install Docker and try again.')
      return
    }
    const dockerDaemonRunning = await isDockerDaemonRunning()

    if (!dockerDaemonRunning) {
      log.error('Docker daemon is not running. Please start Docker and try again.')
      return
    }

    const result = await handler(context)
    return result
  }
}
