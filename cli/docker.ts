import os from 'node:os'
import process from 'node:process'
import Docker from 'dockerode'
import { err, ok } from 'neverthrow'
import { sharedEnv } from '@/env/shared'
import { result } from '@/shared/lib/neverthrow'

export const DELPHIS_IMAGE = 'delphis'

export const docker = new Docker()

const containerOptions: Docker.ContainerCreateOptions = {
  Image: DELPHIS_IMAGE,
  name: 'delphis',

  Env: [
    `USERNAME=${sharedEnv.DELPHIS_USERNAME}`,
    `PASSWORD=${sharedEnv.DELPHIS_PASSWORD}`,
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

    if (error === 'No such container') {
      if (!options.createIfNotExists) {
        return ok(null)
      }

      return ok(
        await docker.createContainer(containerOptions),
      )
    }

    return err(error)
  }

  return ok(container)
}
