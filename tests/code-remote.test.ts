import { afterEach, beforeEach, describe, expect, mock, spyOn, test } from 'bun:test'
import {
  buildSshRemoteAuthority,
  CodeRemotePasswordWithoutUsernameError,
  openRemoteCode,
} from '../lib/code-remote'

// Mock the env module
mock.module('../env/shared', () => ({
  env: {
    DELPHIS_PORT: 22444,
    DELPHIS_USERNAME: 'delphis',
    DELPHIS_PASSWORD: undefined,
    DELPHIS_FOLDER: '/delphis',
  },
}))
mock.module('../env/cli', () => ({
  env: {
    DELPHIS_LAUNCH_EDITOR: 'code',
  },
}))

// Mock Bun.spawn
let mockSpawn: ReturnType<typeof spyOn>
const originalSpawn = Bun.spawn

beforeEach(() => {
  mockSpawn = spyOn(Bun, 'spawn').mockReturnValue({
    pid: 12345,
    stdout: 'inherit',
    stderr: 'inherit',
  } as unknown as ReturnType<typeof Bun.spawn>)
})

afterEach(() => {
  if (mockSpawn) {
    mockSpawn.mockRestore()
  }
  // Restore original spawn
  Bun.spawn = originalSpawn
})

describe('buildSshRemoteAuthority', () => {
  test('should build authority with default values from env', () => {
    const result = buildSshRemoteAuthority({ host: 'example.com' })
    expect(result).toBe('ssh-remote+delphis@example.com:22444')
  })

  test('should build authority with custom host', () => {
    const result = buildSshRemoteAuthority({ host: 'custom-host.com' })
    expect(result).toBe('ssh-remote+delphis@custom-host.com:22444')
  })

  test('should build authority with custom port', () => {
    const result = buildSshRemoteAuthority({
      host: 'example.com',
      port: 2222,
    })
    expect(result).toBe('ssh-remote+delphis@example.com:2222')
  })

  test('should build authority with custom username', () => {
    const result = buildSshRemoteAuthority({
      host: 'example.com',
      username: 'customuser',
    })
    expect(result).toBe('ssh-remote+customuser@example.com:22444')
  })

  test('should build authority with custom username and port', () => {
    const result = buildSshRemoteAuthority({
      host: 'example.com',
      username: 'customuser',
      port: 2222,
    })
    expect(result).toBe('ssh-remote+customuser@example.com:2222')
  })

  test('should build authority with username and password', () => {
    const result = buildSshRemoteAuthority({
      host: 'example.com',
      username: 'user',
      password: 'pass123',
    })
    expect(result).toBe('ssh-remote+user:pass123@example.com:22444')
  })

  test('should build authority with username, password, and custom port', () => {
    const result = buildSshRemoteAuthority({
      host: 'example.com',
      username: 'user',
      password: 'pass123',
      port: 2222,
    })
    expect(result).toBe('ssh-remote+user:pass123@example.com:2222')
  })

  test('should throw CodeRemotePasswordWithoutUsernameError when password is provided and username is empty', () => {
    expect(() => {
      buildSshRemoteAuthority({
        host: 'example.com',
        username: '',
        password: 'pass123',
      })
    }).toThrow(CodeRemotePasswordWithoutUsernameError)
  })

  test('should handle empty username string', () => {
    const result = buildSshRemoteAuthority({
      host: 'example.com',
      username: '',
    })

    expect(result).toBe('ssh-remote@example.com:22444')
  })

  test('should handle undefined username explicitly', () => {
    const result = buildSshRemoteAuthority({
      host: 'example.com',
      username: undefined,
    })
    expect(result).toBe('ssh-remote+delphis@example.com:22444')
  })

  test('should handle undefined password explicitly', () => {
    const result = buildSshRemoteAuthority({
      host: 'example.com',
      username: 'user',
      password: undefined,
    })
    expect(result).toBe('ssh-remote+user@example.com:22444')
  })
})

describe('openRemoteCode', () => {
  beforeEach(() => {
    mockSpawn.mockClear()
    mockSpawn.mockReturnValue({
      pid: 12345,
      stdout: 'inherit',
      stderr: 'inherit',
    } as unknown as ReturnType<typeof Bun.spawn>)
  })

  test('should spawn editor with correct command and arguments', () => {
    const host = 'example.com'
    const codeArgs: string[] = []

    openRemoteCode({ host, codeArgs })

    expect(mockSpawn).toHaveBeenCalledTimes(1)
    expect(mockSpawn).toHaveBeenCalledWith({
      cmd: [
        'code',
        '--remote',
        'ssh-remote+delphis@example.com:22444',
        '/delphis',
      ],
      stdout: 'inherit',
      stderr: 'inherit',
    })
  })

  test('should handle code args with flags', () => {
    const host = 'example.com'
    const codeArgs = ['--new-window', '--wait']

    openRemoteCode({ host, codeArgs })

    // mri parses flags as { 'new-window': true, 'wait': true }
    // cleanCodeArgs converts them to ['--new-window', 'true', '--wait', 'true']
    expect(mockSpawn).toHaveBeenCalledWith({
      cmd: [
        'code',
        '--new-window',
        'true',
        '--wait',
        'true',
        '--remote',
        'ssh-remote+delphis@example.com:22444',
        '/delphis',
      ],
      stdout: 'inherit',
      stderr: 'inherit',
    })
  })

  test('should remove --remote flag from code args if present', () => {
    const host = 'example.com'
    const codeArgs = ['--remote', 'some-remote', '--new-window']

    openRemoteCode({ host, codeArgs })

    // mri parses as { remote: 'some-remote', 'new-window': true }
    // cleanCodeArgs removes 'remote' and converts to ['--new-window', 'true']
    expect(mockSpawn).toHaveBeenCalledWith({
      cmd: [
        'code',
        '--new-window',
        'true',
        '--remote',
        'ssh-remote+delphis@example.com:22444',
        '/delphis',
      ],
      stdout: 'inherit',
      stderr: 'inherit',
    })
  })

  test('should handle code args with values', () => {
    const host = 'example.com'
    const codeArgs = ['--user-data-dir', '/tmp/code']

    openRemoteCode({ host, codeArgs })

    expect(mockSpawn).toHaveBeenCalledWith({
      cmd: [
        'code',
        '--user-data-dir',
        '/tmp/code',
        '--remote',
        'ssh-remote+delphis@example.com:22444',
        '/delphis',
      ],
      stdout: 'inherit',
      stderr: 'inherit',
    })
  })

  test('should return the subprocess from Bun.spawn', () => {
    const mockSubprocess = {
      pid: 12345,
      stdout: 'inherit',
      stderr: 'inherit',
    } as unknown as ReturnType<typeof Bun.spawn>
    mockSpawn.mockReturnValue(mockSubprocess)

    const host = 'example.com'
    const codeArgs: string[] = []

    const result = openRemoteCode({ host, codeArgs })

    expect(result).toBe(mockSubprocess)
  })

  test('should use custom host in authority', () => {
    const host = 'custom-host.example.com'
    const codeArgs: string[] = []

    openRemoteCode({ host, codeArgs })

    expect(mockSpawn).toHaveBeenCalledWith(
      expect.objectContaining({
        cmd: expect.arrayContaining([
          'ssh-remote+delphis@custom-host.example.com:22444',
        ]),
      }),
    )
  })
})

describe('codeRemotePasswordWithoutUsernameError', () => {
  test('should be an instance of CodeRemoteError', () => {
    const error = new CodeRemotePasswordWithoutUsernameError()
    expect(error).toBeInstanceOf(Error)
  })

  test('should have the correct error message', () => {
    const error = new CodeRemotePasswordWithoutUsernameError()
    expect(error.message).toBe(
      'SSH remote authority password cannot be used without a username',
    )
  })
})
