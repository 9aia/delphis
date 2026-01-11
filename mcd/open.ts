#!/usr/bin/env bun
import { Buffer } from 'node:buffer'
import dgram from 'node:dgram'
import os from 'node:os'
import { sharedEnv } from '../env/shared'

const PORT = sharedEnv.DELPHIS_PORT
const AGENT_NAME = os.hostname()

const socket = dgram.createSocket('udp4')

socket.on('message', (msg, rinfo) => {
  if (msg.toString() === 'DISCOVER_AGENTS') {
    console.log(`Received discovery request from ${rinfo.address}:${rinfo.port}`)
    const response = Buffer.from(`AGENT:${AGENT_NAME}`)
    socket.send(response, rinfo.port, rinfo.address, (err) => {
      if (err) {
        console.error('Failed to send response:', err)
      }
      else {
        console.log(`Sent agent info to ${rinfo.address}`)
      }
    })
  }
})

socket.bind(PORT, '0.0.0.0', () => {
  console.log(`Agent "${AGENT_NAME}" running on port ${PORT}`)
  console.log('Listening on all interfaces (including Tailscale network)')
})
