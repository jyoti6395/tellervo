import fs from 'node:fs'
import path from 'node:path'

// Determine which app to output to root dist (default: tellervo-dashboard)
const targetApp = process.env.DEPLOY_APP || 'tellervo-dashboard'
const src = path.resolve(process.cwd(), 'apps', targetApp, 'dist')
const dest = path.resolve(process.cwd(), 'dist')

if (fs.existsSync(src)) {
  fs.rmSync(dest, { recursive: true, force: true })
  fs.cpSync(src, dest, { recursive: true })
  console.log(`Successfully prepared root build output: ${src} -> ${dest}`)
} else {
  // If target app dist doesn't exist, check tellervo-app
  const fallbackSrc = path.resolve(process.cwd(), 'apps', 'tellervo-app', 'dist')
  if (fs.existsSync(fallbackSrc)) {
    fs.rmSync(dest, { recursive: true, force: true })
    fs.cpSync(fallbackSrc, dest, { recursive: true })
    console.log(`Successfully prepared root build output: ${fallbackSrc} -> ${dest}`)
  }
}
