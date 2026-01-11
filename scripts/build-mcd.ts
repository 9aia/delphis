#!/usr/bin/env bun
import process from 'node:process'
import pkg from '../package.json'

try {
  console.log('Building...')

  await Bun.$`
    bun build \
      --compile ${pkg.delphis['mcd-entrypoint']} \
      --define:NODE_ENV=production \
      --define:BUILD_VERSION='"${pkg.version}"' \
      --minify \
      --sourcemap \
      --bytecode \
      --outfile ${pkg.bin['delphis-mcd']}
  `

  await Bun.$`
    docker build -f ./mcd/Dockerfile -t delphis .
  `

  console.log('Built successfully')
}
catch (error) {
  console.error(`Failed to build: ${error instanceof Error ? error.message : String(error)}`)
  process.exit(1)
}
