export namespace Tailscale {
  export interface Device {
    addresses: string[]
    id: string
    nodeId: string
    user: string
    name: string
    hostname: string
    clientVersion: string
    updateAvailable: boolean
    os: string
    created: string
    connectedToControl: boolean
    lastSeen: string
    expires: string
    keyExpiryDisabled: boolean
    authorized: boolean
    isExternal: boolean
    machineKey: string
    nodeKey: string
    tailnetLockKey: string
    blocksIncomingConnections: boolean
    tailnetLockError: string
  }

  export interface DevicesResponse {
    devices: Device[]
  }
}
