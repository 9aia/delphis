import minimist from 'minimist'

import { z } from 'zod'

import { env } from '../env'
import { portSchema, usernameSchema } from './zod'

export abstract class CodeRemoteError extends Error {}

export class CodeRemotePasswordWithoutUsernameError extends CodeRemoteError {
  constructor() {
    super('SSH remote authority password cannot be used without a username')
  }
}

export const buildSshRemoteAuthoritySchema = z.object({
  host: z.string(),
  port: portSchema.optional(),
  username: usernameSchema,
  password: z.string().optional(),
})
export type SshRemoteAuthorityOptions = z.infer<typeof buildSshRemoteAuthoritySchema>

/**
 * Builds an SSH remote authority string for VS Code's --remote flag.
 *
 * The authority format is: `ssh-remote+<username>@<host>:<port>`
 * This is used with VS Code's `--remote` flag to connect to a remote development environment.
 *
 * @throws {CodeRemotePasswordWithoutUsernameError} If password is used without a username
 * @example
 * buildSshRemoteAuthority({ host: 'example.com' })
 * // Returns: "ssh-remote+delphis@example.com:22444"
 */
export function buildSshRemoteAuthority(options: SshRemoteAuthorityOptions): string {
  const {
    host,
    port = env.DELPHIS_PORT,
    username = env.DELPHIS_USERNAME,
    password = env.DELPHIS_PASSWORD,
  } = buildSshRemoteAuthoritySchema.parse(options)

  let authority = `ssh-remote`

  if (username) {
    authority += `+${username}`
  }

  if (password) {
    if (!username) {
      throw new CodeRemotePasswordWithoutUsernameError()
    }

    authority += `:${password}`
  }

  authority += `@${host}:${port}`

  return authority
}

export const codeArgsSchema = z.array(z.string())
export type CodeArgs = z.infer<typeof codeArgsSchema>

/**
 * Cleans code arguments by removing the `--remote` flag and positional arguments.
 *
 * @param codeArgs - The code arguments to clean.
 * @returns The cleaned code arguments.
 */
function cleanCodeArgs(codeArgs: CodeArgs): CodeArgs {
  const safeCodeArgs = codeArgsSchema.parse(codeArgs)

  const argv = minimist(safeCodeArgs)

  // Remove the `remote` key
  delete argv.remote

  // Reconstruct command string
  const newCodeArgs = [
    ...Object.entries(argv)
      .filter(([k]) => k !== '_')
      .flatMap(([k, v]) => [`--${k}`, v]),
  ].map(String)

  return newCodeArgs
}

export const openRemoteCodeSchema = z.object({
  host: z.string(),
  codeArgs: codeArgsSchema,
})
export type OpenRemoteCodeOptions = z.infer<typeof openRemoteCodeSchema>

/**
 * Opens the remote code editor with the given host and code arguments.
 *
 * @param options - The options for opening the remote editor.
 * @param options.host - The host to connect to.
 * @param options.codeArgs - The code arguments to pass to the editor.
 * @throws {CodeRemotePasswordWithoutUsernameError} If password is provided and username is empty
 * @returns The subprocess of the editor.
 */
export function openRemoteCode(options: OpenRemoteCodeOptions) {
  const { host, codeArgs } = openRemoteCodeSchema.parse(options)

  const EDITOR_BIN = env.DELPHIS_LAUNCH_EDITOR
  const FOLDER = env.DELPHIS_FOLDER

  const authority = buildSshRemoteAuthority({
    host,
  })

  // Build command arguments
  const args: string[] = []
  args.push(...cleanCodeArgs(codeArgs))
  args.push('--remote', authority, FOLDER)

  // Run the editor
  const subprocess = Bun.spawn({
    cmd: [EDITOR_BIN, ...args],
    stdout: 'inherit',
    stderr: 'inherit',
  })

  return subprocess
}
