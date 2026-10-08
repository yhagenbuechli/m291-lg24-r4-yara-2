import { cpSync, existsSync, mkdirSync, rmSync } from 'node:fs'
import { join } from 'node:path'

const source = 'api'
const target = join('dist', 'api')

if (!existsSync(source)) {
  console.warn('[build] api/ fehlt – Frontend wurde trotzdem gebaut.')
  process.exit(0)
}

rmSync(target, { recursive: true, force: true })
mkdirSync(target, { recursive: true })
cpSync(source, target, { recursive: true })

console.log('[build] api/ nach dist/api kopiert.')
