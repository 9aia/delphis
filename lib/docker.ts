export async function isDockerDaemonRunning() {
  const proc = Bun.spawn(['docker', 'info'], {
    stdout: 'pipe',
    stderr: 'pipe',
  })

  const [exitCode, stdout, stderr] = await Promise.all([
    proc.exited,
    new Response(proc.stdout).text(),
    new Response(proc.stderr).text(),
  ])

  const output = stdout + stderr
  const isDaemonRunningMessage = output.includes('Is the docker daemon running?')

  return exitCode === 0 && !isDaemonRunningMessage
}
