// finder.ts
import dgram from 'node:dgram'

const PORT = 50000
const BROADCAST_ADDR = '255.255.255.255'
const TIMEOUT_MS = 2000

const socket = dgram.createSocket('udp4')
const agents: Array<{ name: string, ip: string }> = []

socket.bind(() => {
  socket.setBroadcast(true)

  socket.send(
    Buffer.from('DISCOVER_AGENTS'),
    PORT,
    BROADCAST_ADDR,
  )
})

socket.on('message', (msg, rinfo) => {
  const text = msg.toString()
  if (text.startsWith('AGENT:')) {
    agents.push({
      name: text.replace('AGENT:', ''),
      ip: rinfo.address,
    })
  }
})

setTimeout(() => {
  socket.close()
  console.log('Found agents:', agents)
}, TIMEOUT_MS)
