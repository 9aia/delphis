#!/usr/bin/env bun
import { Buffer } from 'node:buffer'
import dgram from 'node:dgram'
import { sharedEnv } from '../env/shared'
import { getTailscaleDevices } from '../lib/tailscale'

const PORT = sharedEnv.DELPHIS_PORT
const TIMEOUT_MS = 2000

interface Agent {
  name: string
  ip: string
  hostname: string
  os: string
}

async function findAgents() {
  const devices = await getTailscaleDevices()
  const agents: Agent[] = []
  const socket = dgram.createSocket('udp4')

  const totalDevices = devices.filter(d => d.connectedToControl).length

  socket.bind(() => {
    console.log(`Searching for agents on ${totalDevices} connected Tailscale devices...\n`)

    for (const device of devices) {
      if (!device.connectedToControl) {
        continue
      }

      for (const address of device.addresses) {
        if (address.includes(':'))
          continue

        socket.send(
          Buffer.from('DISCOVER_AGENTS'),
          PORT,
          address,
          (err) => {
            if (err) {
              console.error(`Failed to send to ${device.hostname} (${address}):`, err.message)
            }
          },
        )
        break
      }
    }
  })

  socket.on('message', (msg, rinfo) => {
    const text = msg.toString()
    if (text.startsWith('AGENT:')) {
      const agentName = text.replace('AGENT:', '')
      const device = devices.find(d => d.addresses.includes(rinfo.address))

      agents.push({
        name: agentName,
        ip: rinfo.address,
        hostname: device?.hostname || 'unknown',
        os: device?.os || 'unknown',
      })

      console.log(`✓ Found agent: ${agentName} on ${device?.hostname || rinfo.address} (${rinfo.address})`)
    }
  })

  setTimeout(() => {
    socket.close()
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log(`Found ${agents.length} agent(s) on Tailscale network:\n`)

    if (agents.length === 0) {
      console.log('No agents found.')
    }
    else {
      agents.forEach((agent, index) => {
        console.log(`${index + 1}. ${agent.name}`)
        console.log(`   IP: ${agent.ip}`)
        console.log(`   Host: ${agent.hostname}`)
        console.log(`   OS: ${agent.os}\n`)
      })
    }

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  }, TIMEOUT_MS)
}

findAgents().catch(console.error)
