import { defineConfig } from 'tsdown'

export default defineConfig({
  entry: [
    'src/index.ts',
    'src/client.ts',
  ],
  format: ['esm', 'cjs'],
  dts: true,
  clean: true,
  outDir: 'lib',
  external: [
    'react',
    'react-dom',
    '@deepseek-ai/dsh',
  ],
  banner: {
    js: '"use client"',
  },
})
