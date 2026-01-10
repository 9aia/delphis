import process from 'node:process'
import { z } from 'zod'
import { portSchema } from './lib/zod'

/**
 * Environment variable schema using Zod
 * Bun automatically loads .env files, so no need for dotenv
 */
const envSchema = z.object({
  // Tailscale API Auth
  DELPHIS_TAILSCALE_API_ACCESS_TOKEN: z.string().nonempty(),
  DELPHIS_TAILSCALE_TAILNET_ID: z.string().nonempty(),

  // SSH connection settings
  DELPHIS_PORT: portSchema.default(22444),

  // Editor settings
  DELPHIS_LAUNCH_EDITOR: z.string().default('code'),
})

/**
 * Validated environment variables
 * Throws an error if validation fails
 */
export const env = envSchema.parse(process.env)

/**
 * Type-safe environment variables
 */
export type Env = z.infer<typeof envSchema>
