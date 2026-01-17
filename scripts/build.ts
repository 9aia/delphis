#!/usr/bin/env bun
import process from 'node:process'
import pkg from '../package.json'

try {
  console.log('Building...')

  await Bun.$`
    bun build \
      --compile ${pkg.module} \
      --production \
      --define:BUILD_VERSION='"${pkg.version}"' \
      --minify \
      --sourcemap \
      --outfile ${pkg.bin.delphis}
  `

  // Make the output executable
  await Bun.$`chmod +x ${pkg.bin.delphis}`

  console.log('Built successfully')
}
catch (error) {
  console.error(`Failed to build: ${error instanceof Error ? error.message : String(error)}`)
  process.exit(1)
}
