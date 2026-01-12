import type { Tailscale } from '@/types/tailscale'
import { Buffer } from 'node:buffer'
import dgram from 'node:dgram'
import { sharedEnv } from '@/shared/env'

interface DiscoveryServerOptions {
  /**
   * The Tailscale devices used to identify which device sent a discovery response message.
   */
  tailscaleDevices: Tailscale.Device[]
  /**
   * The port to use for sending and receiving discovery packets.
   * If not provided, the port will be the default port from the environment variables.
   */
  port?: number
  /**
   * The callback to call if an error occurs.
   *
   * @param error - The error that occurred.
   */
  onError?: (error: Error) => void
  /**
   * The callback to call if the discovery server is closed.
   */
  onClose?: () => void
  /**
   * The callback to call if a discovery client is available.
   *
   * @param client - The discovery client that is available.
   */
  onClientAvailable?: (client: DiscoveryClient) => void

  onMessageError?: (error: DelphisDiscoveryMessageError) => void
}

/**
 * Creates a discovery server that handles available remote development environments on a tailnet.
 *
 * @param options - The options for the discovery server.
 * @returns A discovery server instance.
 */
export function createDiscoveryServer(
  options: DiscoveryServerOptions,
): DiscoveryServer {
  const socket = dgram.createSocket({ type: 'udp4' })
  const PORT = options.port || sharedEnv.DELPHIS_PORT
  const pendingRequests = new Map<string, { timer: NodeJS.Timeout }>()
  const tailscaleDevices = options.tailscaleDevices

  const removePendingRequest = (address: string): void => {
    const request = pendingRequests.get(address)
    if (request) {
      clearTimeout(request.timer)
      pendingRequests.delete(address)
    }
  }

  const cleanupPendingRequests = (): void => {
    for (const request of pendingRequests.values()) {
      clearTimeout(request.timer)
    }
    pendingRequests.clear()
  }

  const requestAddress = (
    address: string,
    options: RequestAddressOptions,
  ): void => {
    const timeout = options.timeout || 3000

    // Skip IPv6 addresses
    if (address.includes(':')) {
      return
    }

    socket.send(
      Buffer.from('AVAILABILITY_REQUEST'),
      PORT,
      address,
      (error) => {
        // Handle error
        if (error) {
          const err = new DelphisDiscoveryPacketError(
            `Failed to send discovery packet to ${address}: ${error.message}`,
            error,
          )
          options.onError?.(err)
          return
        }

        // Set timeout to handle the request if no response is received
        const timer = setTimeout(() => {
          pendingRequests.delete(address)
          const timeoutError = new DelphisDiscoveryTimeoutError(
            `Discovery timeout: No response from ${address} within ${timeout}ms`,
          )
          options.onError?.(timeoutError)
        }, timeout)

        pendingRequests.set(address, { timer })
      },
    )
  }

  const requestDevice = (device: Tailscale.Device, options: RequestDeviceOptions): void => {
    for (const address of device.addresses) {
      requestAddress(address, options)
    }
  }

  const requestNetwork = (options: RequestNetworkOptions): void => {
    for (const device of tailscaleDevices) {
      if (!device.connectedToControl) {
        continue
      }

      requestDevice(device, options)
    }
  }

  const handleMessage = (msg: Buffer, rinfo: dgram.RemoteInfo): void => {
    const text = msg.toString()

    if (!text.startsWith('AGENT:')) {
      const error = new DelphisDiscoveryMessageInvalidError(`Invalid message received: ${text}`)
      options.onMessageError?.(error)
      return
    }

    const device = options.tailscaleDevices.find(d => d.addresses.includes(rinfo.address))
    if (!device) {
      const error = new DelphisDiscoveryMessageDeviceNotFoundError(`Device not found: ${rinfo.address}`)
      options.onMessageError?.(error)
      return
    }

    const request = pendingRequests.get(rinfo.address)
    if (!request) {
      const error = new DelphisDiscoveryMessageRequestNotFoundError(`Request not found: ${rinfo.address}`)
      options.onMessageError?.(error)
      return
    }

    removePendingRequest(rinfo.address)

    const client: DiscoveryClient = {
      hostname: device.hostname,
      os: device.os,
      ip: rinfo.address,
    }

    options.onClientAvailable?.(client)
  }

  const setupSocket = (): void => {
    socket.on('message', handleMessage)

    socket.on('error', (error) => {
      socket.close()
      options.onError?.(error)
    })

    socket.on('close', () => {
      cleanupPendingRequests()
      options.onClose?.()
    })
  }

  const open = () => {
    setupSocket()
    socket.bind(PORT)
  }

  const close = () => {
    cleanupPendingRequests()
    socket.close()
  }

  return {
    requestAddress,
    requestDevice,
    requestNetwork,
    open,
    close,
  }
}

export interface DiscoveryServer {
  /**
   * Requests an address to be discovered.
   *
   * - If the address is not IPv4, it will be skipped.
   *
   * @param address - The address to request.
   * @param options - The options for the request.
   */
  requestAddress: (address: string, options: RequestAddressOptions) => void
  /**
   * Requests a device to be discovered.
   *
   * - If the device is not connected to the Tailnet, it will be skipped.
   *
   * @param device - The device to request.
   * @param options - The options for the request.
   */
  requestDevice: (device: Tailscale.Device, options: RequestDeviceOptions) => void
  /**
   * Requests all connected devices to be discovered.
   *
   * - If a device is not connected to the Tailnet, it will be skipped.
   *
   * @param options - The options for the request.
   */
  requestNetwork: (options: RequestNetworkOptions) => void
  /**
   * Opens the discovery server.
   */
  open: () => void
  /**
   * Closes the discovery server.
   */
  close: () => void
}

export interface RequestAddressOptions {
  /**
   * The callback to call if an error occurs.
   *
   * @param error - The error that occurred. May be a `DelphisDiscoveryPacketError` or a `DelphisDiscoveryTimeoutError`.
   */
  onError?: (error: DelphisDiscoveryError) => void
  /**
   * The timeout in milliseconds for the discovery response to be received.
   *
   * @default 3000
   */
  timeout?: number
}

export interface RequestDeviceOptions {
  /**
   * The callback to call if an error occurs.
   *
   * @param error - The error that occurred. May be either a `DelphisDiscoveryPacketError` or a `DelphisDiscoveryTimeoutError`.
   */
  onError?: (error: DelphisDiscoveryError) => void
  /**
   * The timeout in milliseconds for the discovery response to be received.
   *
   * @default 3000
   */
  timeout?: number
}

export interface RequestNetworkOptions {
  /**
   * The callback to call if an error occurs.
   *
   * @param error - The error that occurred. May be either a `DelphisDiscoveryPacketError` or a `DelphisDiscoveryTimeoutError`.
   */
  onError?: (error: DelphisDiscoveryError) => void
  /**
   * The timeout in milliseconds for the discovery response to be received.
   *
   * @default 3000
   */
  timeout?: number
}

export interface DiscoveryClient {
  ip: string
  hostname: string
  os: string
}

export class DelphisDiscoveryError extends Error {
  constructor(message: string, readonly original?: Error) {
    super(message)
    this.name = 'DelphisDiscoveryError'
  }
}

export class DelphisDiscoveryPacketError extends DelphisDiscoveryError {
  constructor(message: string, override original: Error) {
    super(message, original)
    this.name = 'DelphisDiscoveryPacketError'
  }
}

export class DelphisDiscoveryTimeoutError extends DelphisDiscoveryError {
  constructor(message: string) {
    super(message)
    this.name = 'DelphisDiscoveryTimeoutError'
  }
}

export class DelphisDiscoveryMessageError extends DelphisDiscoveryError {
  constructor(message: string) {
    super(message)
    this.name = 'DelphisDiscoveryMessageError'
  }
}

export class DelphisDiscoveryMessageInvalidError extends DelphisDiscoveryMessageError {
  constructor(message: string) {
    super(message)
    this.name = 'DelphisDiscoveryMessageInvalidError'
  }
}

export class DelphisDiscoveryMessageDeviceNotFoundError extends DelphisDiscoveryMessageError {
  constructor(message: string) {
    super(message)
    this.name = 'DelphisDiscoveryMessageDeviceNotFoundError'
  }
}

export class DelphisDiscoveryMessageRequestNotFoundError extends DelphisDiscoveryMessageError {
  constructor(message: string) {
    super(message)
    this.name = 'DelphisDiscoveryMessageRequestNotFoundError'
  }
}
