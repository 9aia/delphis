import { z } from 'zod'

// Linux username regex: must start with letter or underscore, can contain letters, digits, underscores, and hyphens
// Length: 1-32 characters (standard Linux limit)
const LINUX_USERNAME_REGEX = /^[a-z_][\w-]{0,31}$/i

export const linuxUsernameSchema = z
  .string()
  .refine(
    val => val === '' || LINUX_USERNAME_REGEX.test(val),
    {
      message: 'Username must be a valid Linux username (start with letter/underscore, 1-32 chars, alphanumeric, hyphens, underscores)',
    },
  )
  .transform(val => (val === '' ? null : val))
  .nullable()
  .optional()

export const tcpPortSchema = z
  .transform(String)
  .refine(v => !/e/i.test(v), { message: 'Port must be an integer' })
  .transform(v => Number(v))
  .pipe(
    z.number()
      .int('Port must be an integer')
      .min(1, 'Port must be greater than 0')
      .max(65535, 'Port must be between 1 and 65535'),
  )
