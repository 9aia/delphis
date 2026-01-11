import process from 'node:process'
import { ResultAsync } from 'neverthrow'
import { logger } from '@/cli/logger'
import { getErrorMessage } from '@/shared/lib/error'

export const mapError = (error: unknown) => getErrorMessage(error)

export interface SafePromiseOptions {
  crashOnError?: boolean
}

export function result<T>(
  fn: () => Promise<T>,
  options: SafePromiseOptions = {},
): ResultAsync<T, string> {
  return ResultAsync.fromPromise(
    fn(),
    (error) => {
      if (options.crashOnError) {
        logger.error(error)
        process.exit(1)
      }
      return mapError(error)
    },
  )
}

export async function crashOnError<T>(
  fn: () => Promise<T>,
): Promise<T> {
  try {
    return await fn()
  }
  catch (error) {
    logger.error(error)
    process.exit(1)
  }
}
