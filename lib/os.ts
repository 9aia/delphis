export async function isBinaryInstalled(binary: string): Promise<boolean> {
  const proc = Bun.spawn(['which', binary], {
    stdout: 'ignore',
    stderr: 'ignore',
  })

  const exitCode = await proc.exited
  return exitCode === 0
}
