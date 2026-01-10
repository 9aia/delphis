import { env } from '../env'

interface BuildRemoteAuthorityOptions {
  host: string
  port: number
  username: string
}

/**
 * Constructs a remote SSH authority for VS Code remote connections
 */
export function buildRemoteAuthority({
  host,
  port = env.DELPHIS_PORT,
  username = env.DELPHIS_USERNAME,
}: BuildRemoteAuthorityOptions): string {
  return `ssh-remote+${username}@${host}:${port}`
}
