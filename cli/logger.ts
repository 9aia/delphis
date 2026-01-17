import type { Logger } from 'pino'
import fs from 'node:fs'
import path from 'node:path'
import pino from 'pino'
import { sharedEnv } from '@/shared/env'

let _logger: Logger | null = null

function initLogger(): Logger {
  if (_logger) {
    return _logger
  }

  const isDev = sharedEnv.NODE_ENV === 'development'

  // In development, write to logs directory
  // In production/compiled binary, just use stdout to avoid file descriptor issues
  if (isDev) {
    try {
      fs.mkdirSync('logs', { recursive: true })
      _logger = pino(
        { level: 'trace' },
        pino.destination({
          dest: path.join('logs', 'development.log'),
          sync: true,
        }),
      )
      return _logger
    }
    catch {
      // Fall through to console logger
    }
  }

  // Production or fallback: use stdout
  _logger = pino({ level: 'info' })
  return _logger
}

export const logger = new Proxy({} as Logger, {
  get(_target, prop) {
    const log = initLogger()
    return log[prop as keyof Logger]
  },
})
