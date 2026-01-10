import { defineCommand } from '@bunli/core'
import pkg from '../../package.json'

export default defineCommand({
  name: 'version',
  description: 'Show version information',
  handler: async () => {
    console.log(pkg.version)
  },
})
