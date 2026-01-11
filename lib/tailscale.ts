import type { TailscaleDevicesResponse } from '../types/tailscale/devices'
import os from 'node:os'
import { ofetch } from 'ofetch'
import { cliEnv } from '../env/cli'

const TAILSCALE_API_URL = 'https://api.tailscale.com/api/v2'

const fetchTailscale = ofetch.create({
  baseURL: TAILSCALE_API_URL,
  headers: {
    Authorization: `Bearer ${cliEnv.DELPHIS_TAILSCALE_API_ACCESS_TOKEN}`,
  },
})

export async function isTailscaleUp() {
  const tailscaleIp = getTailscaleIp()

  if (!tailscaleIp) {
    return false
  }

  return await isTailscaleIpOnline(tailscaleIp)
}

export function isTailscaleIP(ip?: string) {
  if (!ip) {
    return false
  }

  const [a, b] = ip.split('.').map(Number)

  if (!a || !b) {
    return false
  }

  return a === 100 && b >= 64 && b <= 127
}

export function getTailscaleIp() {
  const nets = os.networkInterfaces()

  if (!nets) {
    throw new Error('No network interfaces found')
  }

  for (const name of Object.keys(nets)) {
    if (!nets[name])
      continue

    for (const net of nets[name]) {
      if (net.family === 'IPv4' && !net.internal) {
        const ip = net.address

        if (isTailscaleIP(ip)) {
          return ip
        }
      }
    }
  }
}

export async function isTailscaleIpOnline(ip: string) {
  const isTailscaleIp = isTailscaleIP(ip)

  if (!isTailscaleIp) {
    return false
  }

  const devices = await fetchTailscale<TailscaleDevicesResponse>(
    `/tailnet/${cliEnv.DELPHIS_TAILSCALE_TAILNET_ID}/devices`,
  )

  for (const device of devices.devices) {
    for (const address of device.addresses) {
      if (address === ip) {
        return device.connectedToControl
      }
    }
  }

  return false
}

export async function getTailscaleDevices() {
  const devices = await fetchTailscale<TailscaleDevicesResponse>(
    `/tailnet/${cliEnv.DELPHIS_TAILSCALE_TAILNET_ID}/devices`,
  )

  return devices.devices
}
