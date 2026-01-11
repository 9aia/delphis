import type { CommandManifest } from '@bunli/core'

const manifest: CommandManifest = {
  join: () => import('./commands/join'),
  share: () => import('./commands/share'),
  stop: () => import('./commands/stop'),
  postinstall: () => import('./commands/postinstall'),
}

export default manifest
