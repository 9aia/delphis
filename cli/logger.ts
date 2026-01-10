import fs from 'node:fs'
import pino from 'pino'

// Ensure logs directory exists
if (!fs.existsSync('./logs')) {
  fs.mkdirSync('./logs', { recursive: true })
}

export const logger = pino({
  transport: {
    targets: [
      { target: 'pino/file', options: { destination: `./logs/${new Date().toISOString()}.log` } },
    ],
  },
})
