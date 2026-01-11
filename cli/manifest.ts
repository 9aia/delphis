import type { CommandManifest } from '@bunli/core'

const manifest: CommandManifest = {
  join: () => import('./commands/join'),
  share: () => import('./commands/share'),
  unshare: () => import('./commands/unshare'),
  status: () => import('./commands/status'),
  postinstall: () => import('./commands/postinstall'),
}

export default manifest
