import type { CommandDefinition } from 'cheloni'
import join from './commands/join'
import postinstall from './commands/postinstall'
import share from './commands/share'
import status from './commands/status'
import unshare from './commands/unshare'

const manifest: CommandDefinition[] = [
  join,
  postinstall,
  share,
  status,
  unshare,
] as const

export default manifest
