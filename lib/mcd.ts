import type dgram from 'node:dgram'
import type { Tailscale } from '@/types/tailscale'
import { Buffer } from 'node:buffer'
import { sharedEnv } from '@/shared/env'

const PORT = sharedEnv.DELPHIS_PORT

export interface Agent {
  ip: string
  hostname: string
  os: string
}

interface BindSocketParams {
  socket: dgram.Socket
  tailscaleDevices: Tailscale.Device[]
  onPacketSent?: (device: Tailscale.Device) => void
  onFinish?: () => void
}

export function sendDiscoveryPackets(params: BindSocketParams) {
  const {
    socket,
    tailscaleDevices,
    onPacketSent,
    onFinish,
  } = params

  socket.bind(async () => {
    for (const device of tailscaleDevices) {
      if (!device.connectedToControl) {
        continue
      }

      const socketPromises = []

      for (const address of device.addresses) {
        if (address.includes(':'))
          continue

        socketPromises.push(() => new Promise((resolve) => {
          socket.send(
            Buffer.from('DISCOVER_AGENTS'),
            PORT,
            address,
            (err) => {
              if (err) {
                resolve(null)
              }
              else {
                resolve(null)
              }
            },
          )
        }))
      }

      await Promise.all(socketPromises.map(p => p()))
      onPacketSent?.(device)
    }
    onFinish?.()
  })
}

interface OnDiscoveryMessageParams {
  socket: dgram.Socket
  tailscaleDevices: Tailscale.Device[]
  onNewAgent: (agent: Agent) => void
}

export function onDiscoveryMessage(params: OnDiscoveryMessageParams) {
  const { socket, tailscaleDevices, onNewAgent } = params

  socket.on('message', (msg, rinfo) => {
    const text = msg.toString()

    if (!text.startsWith('AGENT:')) {
      return
    }

    const device = tailscaleDevices.find(d => d.addresses.includes(rinfo.address))

    onNewAgent({
      hostname: device?.hostname || 'unknown',
      os: device?.os || 'unknown',
      ip: rinfo.address,
    })
  })
}
