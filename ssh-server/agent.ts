import dgram from 'node:dgram'

const PORT = 50000
const AGENT_NAME = 'agent-01'

const socket = dgram.createSocket('udp4')

socket.on('message', (msg, rinfo) => {
  if (msg.toString() === 'DISCOVER_AGENTS') {
    const response = Buffer.from(`AGENT:${AGENT_NAME}`)
    socket.send(response, rinfo.port, rinfo.address)
  }
})

socket.bind(PORT, () => {
  console.log('Agent running')
})
