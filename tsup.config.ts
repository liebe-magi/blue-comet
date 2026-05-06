import { defineConfig } from 'tsup';
import { copyFileSync, chmodSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

export default defineConfig([
  {
    name: 'react',
    entry: { index: 'src/index.ts' },
    format: ['esm', 'cjs'],
    dts: true,
    sourcemap: true,
    clean: true,
    target: 'es2020',
    external: ['react', 'react-dom', '@atproto/api'],
    banner: { js: "'use client';" },
    treeshake: true,
    onSuccess: async () => {
      const src = resolve('src/styles.css');
      const dest = resolve('dist/styles.css');
      if (existsSync(src)) {
        copyFileSync(src, dest);
      }
    },
  },
  {
    name: 'cli',
    entry: { 'cli/index': 'src/cli/index.ts' },
    format: ['esm'],
    dts: true,
    sourcemap: true,
    target: 'node18',
    platform: 'node',
    external: ['@atproto/api', 'gray-matter', 'cac', 'kleur', 'prompts'],
  },
  {
    name: 'cli-bin',
    entry: { 'cli/bin': 'src/cli/bin.ts' },
    format: ['esm'],
    dts: false,
    sourcemap: false,
    target: 'node18',
    platform: 'node',
    external: ['@atproto/api', 'gray-matter', 'cac', 'kleur', 'prompts'],
    banner: { js: '#!/usr/bin/env node' },
    onSuccess: async () => {
      const bin = resolve('dist/cli/bin.js');
      if (existsSync(bin)) {
        chmodSync(bin, 0o755);
      }
    },
  },
]);
