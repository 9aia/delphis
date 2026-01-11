import fs from 'node:fs'
import path from 'node:path'
import pino from 'pino'
import { sharedEnv } from '@/shared/env'

// Ensure logs directory exists
fs.mkdirSync('logs', { recursive: true })

// ISO timestamp safe for filenames
const date = sharedEnv.NODE_ENV === 'development'
  ? 'development'
  : new Date().toISOString().replace(/[:.]/g, '-')

export const logger = pino(
  {
    level: sharedEnv.NODE_ENV === 'development' ? 'trace' : 'info',
  },
  pino.destination({
    dest: path.join('logs', `${date}.log`),
    sync: false, // async = better performance
  }),
)
