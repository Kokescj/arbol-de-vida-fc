// Genera todos los iconos PNG del PWA desde public/favicon.svg.
// Ejecutar: pnpm icons
//
// Cuando cambies el logo, actualizá public/favicon.svg y volvé a correr este script.

import sharp from 'sharp'
import { readFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const publicDir = resolve(__dirname, '..', 'public')
const svg = readFileSync(resolve(publicDir, 'favicon.svg'))

// Color de fondo del manifest (debe matchear theme_color del vite.config.ts).
const BACKGROUND = { r: 15, g: 23, b: 42, alpha: 1 } // #0f172a

const tasks = [
  {
    name: 'pwa-192x192.png',
    description: 'Android home/maskable fallback',
    build: () => sharp(svg, { density: 512 }).resize(192, 192).png(),
  },
  {
    name: 'pwa-512x512.png',
    description: 'Android splash + tienda',
    build: () => sharp(svg, { density: 512 }).resize(512, 512).png(),
  },
  {
    name: 'pwa-512x512-maskable.png',
    description: 'Android maskable (logo dentro del safe area 80%)',
    build: () =>
      sharp(svg, { density: 512 })
        .resize(410, 410) // ~80% del 512
        .extend({
          top: 51,
          bottom: 51,
          left: 51,
          right: 51,
          background: BACKGROUND,
        })
        .png(),
  },
  {
    name: 'apple-touch-icon.png',
    description: 'iOS home screen (180x180 estándar)',
    build: () => sharp(svg, { density: 512 }).resize(180, 180).png(),
  },
  {
    name: 'favicon-32x32.png',
    description: 'Favicon fallback PNG',
    build: () => sharp(svg, { density: 256 }).resize(32, 32).png(),
  },
  {
    name: 'favicon-16x16.png',
    description: 'Favicon fallback PNG pequeño',
    build: () => sharp(svg, { density: 128 }).resize(16, 16).png(),
  },
]

console.log('Generando iconos PWA desde public/favicon.svg...\n')
for (const task of tasks) {
  const dest = resolve(publicDir, task.name)
  await task.build().toFile(dest)
  console.log(`  ✓ ${task.name.padEnd(28)} ${task.description}`)
}
console.log('\nListo. Reconstruí el frontend para que el SW indexe los nuevos iconos:')
console.log('  pnpm build')
