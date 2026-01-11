import type { Handler, HandlerArgs } from '@bunli/core'
import { intro, log } from '@clack/prompts'
import c from 'chalk'
import Docker from 'dockerode'
import pkg from '../../package.json'
import { isBinaryInstalled } from '../lib/os'

const docker = new Docker()

export function dockerHandler<TFlags = Record<string, unknown>, TStore = {}, TCommandName extends string = string>(
  handler: (
    context: HandlerArgs<TFlags, TStore, TCommandName> & { container: Docker.Container },
  ) => Promise<void>,
): Handler<TFlags, TStore, TCommandName> {
  return async (context) => {
    intro(c.inverse(pkg.name))

    const dockerInstalled = await isBinaryInstalled('docker')

    if (!dockerInstalled) {
      log.error('Docker is not installed. Please install Docker and try again.')
      return
    }

    const container = docker.getContainer('delphis')

    const result = await handler({ ...context, container })
    return result
  }
}
