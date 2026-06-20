import { resolve } from 'node:path';
import { cpSync } from 'node:fs';
import { defineConfig } from 'vite';

// Single multi-page build for GitHub Pages: landing + both apps into one dist/.
// base:'./' => relative asset URLs, so it works under any repo sub-path
// (user.github.io/<repo>/) without hardcoding the repo name.
const root = import.meta.dirname;

// earth-drop-calc is an all-classic-<script> app (no ESM entry), so Vite bundles
// only its CSS, not its JS. Copy the raw script trees it references verbatim so the
// built site works. fed-wabis-v2 is ESM and bundles normally — needs nothing here.
// ponytail: static copy, not a bundler for EDC. Replace when EDC migrates to ESM (Phase 3).
const copyEdcStatic = {
  name: 'copy-edc-static',
  closeBundle() {
    const cp = (from, to) => cpSync(resolve(root, from), resolve(root, to), { recursive: true });
    cp('apps/earth-drop-calc/app', 'dist/apps/earth-drop-calc/app');
    cp('packages/jsgraph-vendor/src', 'dist/packages/jsgraph-vendor/src');
  },
};

export default defineConfig({
  base: './',
  plugins: [copyEdcStatic],
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        index: resolve(root, 'index.html'),
        drop: resolve(root, 'apps/earth-drop-calc/index.html'),
        fed: resolve(root, 'apps/fed-wabis-v2/index.html'),
      },
    },
  },
});
