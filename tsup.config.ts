import { defineConfig } from 'tsup';
import { chmodSync, copyFileSync, existsSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const pkg = JSON.parse(readFileSync(resolve('package.json'), 'utf8')) as { version: string };
const VERSION_DEFINE = { 'process.env.BLUECOMET_VERSION': JSON.stringify(pkg.version) };

const USE_CLIENT_DIRECTIVE = "'use client';\n";

function prependUseClient(file: string): void {
  if (!existsSync(file)) return;
  const content = readFileSync(file, 'utf8');
  if (content.startsWith("'use client'") || content.startsWith('"use client"')) return;
  writeFileSync(file, USE_CLIENT_DIRECTIVE + content);
}

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
    treeshake: true,
    onSuccess: async () => {
      // Mark the bundled React entry as a Client Component for Next.js / RSC
      // bundlers. esbuild strips both source directives and the `banner`
      // option's contents during bundling, so prepend it directly.
      prependUseClient(resolve('dist/index.js'));
      prependUseClient(resolve('dist/index.cjs'));

      const cssSrc = resolve('src/styles.css');
      const cssDest = resolve('dist/styles.css');
      if (existsSync(cssSrc)) {
        copyFileSync(cssSrc, cssDest);
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
    define: VERSION_DEFINE,
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
    define: VERSION_DEFINE,
    onSuccess: async () => {
      const bin = resolve('dist/cli/bin.js');
      if (existsSync(bin)) {
        chmodSync(bin, 0o755);
      }
    },
  },
]);
