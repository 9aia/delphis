import z from 'zod'

export const usernameSchema = z
  .string()
  .transform(val => (val === '' ? null : val))
  .optional()

export const portSchema = z.coerce.number()
  .int('Port must be an integer')
  .min(1, 'Port must be greater than 0')
  .max(65535, 'Port must be less than or equal to 65535')
