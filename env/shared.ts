import process from 'node:process'
import { z } from 'zod'
import { tcpPortSchema } from '../lib/zod'

/**
 * Environment variable schema using Zod
 * Bun automatically loads .env files, so no need for dotenv
 */
const envSchema = z.object({
  // SSH connection settings
  DELPHIS_USERNAME: z.string().nullable().default('delphis'),
  DELPHIS_PASSWORD: z.string(),
  DELPHIS_PORT: tcpPortSchema.default(22444),

  // Root project container folder
  DELPHIS_FOLDER: z.string().default('/delphis'),

  NODE_ENV: z.enum(['development', 'test', 'production']).default('production'),
})

/**
 * Validated environment variables
 * Throws an error if validation fails
 */
export const sharedEnv = envSchema.parse(process.env)

/**
 * Type-safe environment variables
 */
export type Env = z.infer<typeof envSchema>
