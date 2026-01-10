import { colors } from '@bunli/utils'

export interface Logger {
  info: (message: string) => void
  warn: (message: string) => void
  error: (message: string) => void
  debug: (message: string) => void
}

export function createLogger(): Logger {
  return {
    info(message: string) {
      console.log(`[${colors.green('INFO')}] ${message}`)
    },

    warn(message: string) {
      console.warn(`[${colors.yellow('WARN')}] ${message}`)
    },

    error(message: string) {
      console.error(`[${colors.red('ERROR')}] ${message}`)
    },

    debug(message: string) {
      if (Bun.env.NODE_ENV !== 'development') {
        return
      }

      console.log(`[${colors.dim('DEBUG')}] ${message}`)
    },
  }
}
