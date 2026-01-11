import antfu from '@antfu/eslint-config'

export default antfu({
  formatters: true,
  rules: {
    'no-console': 'off',
    'ts/no-empty-object-type': 'off',
  },
  ignores: [
    '.bunli/commands.gen.ts',
  ],
})
