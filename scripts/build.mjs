/**
 * Build both halves of dsh-session-admin.
 *
 * Host  (lib/index.js):  plain ESM cordis plugin (apply/inject/name) - the
 *                        profile's Node loader imports it like any package.
 * Client (lib/client.js): a CJS-form bundle wrapped in the browser module
 *                        system's factory protocol
 *                        (window.__ModuleLoader__.load({id, factory})), with
 *                        the module-table seed words externalized (react,
 *                        ui-primitives, ...) and the plugin-owned CSS inlined
 *                        into a <style data-plugin="dsh-session-admin"> tag
 *                        (the loader inventories it for HMR teardown).
 */
import { build } from 'esbuild'
import { mkdir, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
await mkdir(resolve(root, 'lib'), { recursive: true })

// 鈹€鈹€ host half 鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€
await build({
  entryPoints: [resolve(root, 'src/host/index.ts')],
  outfile: resolve(root, 'lib/index.js'),
  format: 'esm',
  platform: 'node',
  target: ['node20'],
  bundle: true,
  packages: 'external',
  logLevel: 'info',
})

// 鈹€鈹€ client half 鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€
// The shell's module table: every external below is a platform seed word.
const clientExternals = [
  'react',
  'react/jsx-runtime',
  'react-dom',
  'react-dom/client',
  '@deepseek-ai/cordis',
  '@deepseek-ai/dsh-client-ui-slots',
  '@deepseek-ai/dsh-client-web-react',
  '@deepseek-ai/dsh-client-ui-primitives',
  '@deepseek-ai/dsh-client-ui-attachment',
  '@deepseek-ai/dsh-client-schema-form',
  '@deepseek-ai/dsh-client-runtime/client',
  '@deepseek-ai/dsh-client-locale/client',
]

const result = await build({
  entryPoints: [resolve(root, 'src/client/index.tsx')],
  outfile: resolve(root, 'lib/client.js'),
  format: 'cjs',
  platform: 'browser',
  target: ['es2022'],
  bundle: true,
  jsx: 'automatic',
  loader: { '.module.css': 'local-css' },
  external: clientExternals,
  write: false,
  logLevel: 'info',
})

const jsOutput = result.outputFiles.find(file => file.path.endsWith('client.js'))
const cssOutput = result.outputFiles.find(file => file.path.endsWith('.css'))
if (jsOutput === undefined) throw new Error('build: client bundle produced no JS output')
const cssText = cssOutput?.text ?? ''

const body = jsOutput.text.replace(/\/\/# sourceMappingURL=.*$/m, '')

const clientBundle = [
  'window.__ModuleLoader__.load({',
  '  id: "dsh-session-admin",',
  '  factory: (require) => {',
  '    var module = { exports: {} };',
  '    var exports = module.exports;',
  '    Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });',
  `    var __DSM_CSS_TEXT__ = ${JSON.stringify(cssText)};`,
  '    (function () {',
  '      if (typeof document !== "undefined" && document.querySelector(\'style[data-plugin-css="dsh-session-admin/styles.module.css"]\') === null) {',
  '        var tag = document.createElement("style");',
  '        tag.dataset.plugin = "dsh-session-admin";',
  '        tag.dataset.pluginCss = "dsh-session-admin/styles.module.css";',
  '        tag.textContent = __DSM_CSS_TEXT__;',
  '        document.head.appendChild(tag);',
  '      }',
  '    })();',
  body,
  '    return module.exports;',
  '  }',
  '});',
  '',
].join('\n')

await writeFile(resolve(root, 'lib/client.js'), clientBundle)
console.log(`dsh-session-admin: built lib/index.js and lib/client.js (css ${cssText.length} chars)`)
