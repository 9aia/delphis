import os from 'node:os'
import process from 'node:process'
import Docker from 'dockerode'
import { err, ok } from 'neverthrow'
import { sharedEnv } from '@/shared/env'
import { result } from '@/shared/lib/neverthrow'

export const docker = new Docker()

const containerOptions: Docker.ContainerCreateOptions = {
  Image: 'delphis',
  name: 'delphis',

  Env: [
    `USERNAME=${sharedEnv.DELPHIS_USERNAME}`,
    `PASSWORD=${sharedEnv.DELPHIS_PASSWORD}`,
    `HOST_UID=${os.userInfo().uid}`,
    `HOST_GID=${os.userInfo().gid}`,
  ],

  HostConfig: {
    PortBindings: {
      [`${sharedEnv.DELPHIS_PORT}/tcp`]: [{ HostPort: '22444' }],
      [`${sharedEnv.DELPHIS_PORT}/udp`]: [{ HostPort: '22444' }],
    },

    Binds: [
      `${os.homedir()}/.gitconfig:/home/${sharedEnv.DELPHIS_USERNAME}/.gitconfig:ro`,
      `${process.cwd()}:${sharedEnv.DELPHIS_FOLDER}`,
    ],
  },
}

interface GetContainerOptions {
  createIfNotExists?: boolean
}

export async function getContainer(options: GetContainerOptions = {
  createIfNotExists: true,
}) {
  const container = docker.getContainer('delphis')
  const inspectResult = await result(() => container.inspect())

  if (inspectResult.isErr()) {
    const error = inspectResult.error

    // Handle not found
    if (error.includes('No such container')) {
      if (!options.createIfNotExists) {
        return ok(null)
      }

      return ok(
        await docker.createContainer(containerOptions),
      )
    }

    return err(error)
  }

  const stopAndRemoveResult = await result(async () => {
    if (inspectResult.value.State.Running) {
      // Stop the container if it is running
      await container.stop()
    }

    // Remove the container
    await container.remove()
  })

  if (stopAndRemoveResult.isErr()) {
    return err(stopAndRemoveResult.error)
  }

  // Create a new container
  return ok(await docker.createContainer(containerOptions))
}
