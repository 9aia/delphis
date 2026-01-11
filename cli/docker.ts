import os from 'node:os'
import process from 'node:process'
import Docker from 'dockerode'
import { sharedEnv } from '@/env/shared'

export const DELPHIS_IMAGE = 'delphis'

export const docker = new Docker()

export const container = await docker.createContainer({
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
})
