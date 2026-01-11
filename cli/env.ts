import process from 'node:process'
import { z } from 'zod'

/**
 * Environment variable schema using Zod
 * Bun automatically loads .env files, so no need for dotenv
 */
const envSchema = z.object({
  // Tailscale API Auth
  DELPHIS_TAILSCALE_API_ACCESS_TOKEN: z.string().nonempty(),
  DELPHIS_TAILSCALE_TAILNET_ID: z.string().nonempty(),

  // Editor settings
  DELPHIS_LAUNCH_EDITOR: z.string().default('code'),
})

/**
 * Validated environment variables
 * Throws an error if validation fails
 */
export const cliEnv = envSchema.parse(process.env)

/**
 * Type-safe environment variables
 */
export type Env = z.infer<typeof envSchema>
