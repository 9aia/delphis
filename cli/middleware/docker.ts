import type { Middleware } from 'cheloni'
import { intro, log } from '@clack/prompts'
import c from 'chalk'
import { isDockerDaemonRunning } from '../../lib/docker'
import { isBinaryInstalled } from '../../lib/os'
import pkg from '../../package.json'

export const dockerMiddleware: Middleware = async ({ next }) => {
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

  const result = await next()
  return result
}
