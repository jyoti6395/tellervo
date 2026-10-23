import fs from 'node:fs'
import path from 'node:path'

// Determine which app to output to root dist
const argApp = process.argv[2]
const targetApp = argApp || process.env.DEPLOY_APP || 'tellervo-dashboard'
const src = path.resolve(process.cwd(), 'apps', targetApp, 'dist')
const dest = path.resolve(process.cwd(), 'dist')

if (fs.existsSync(src)) {
  fs.rmSync(dest, { recursive: true, force: true })
  fs.cpSync(src, dest, { recursive: true })
  console.log(`Successfully prepared root build output: ${src} -> ${dest}`)
} else {
  // If target app dist doesn't exist, check fallback
  const fallbackApp = targetApp === 'tellervo-dashboard' ? 'tellervo-app' : 'tellervo-dashboard'
  const fallbackSrc = path.resolve(process.cwd(), 'apps', fallbackApp, 'dist')
  if (fs.existsSync(fallbackSrc)) {
    fs.rmSync(dest, { recursive: true, force: true })
    fs.cpSync(fallbackSrc, dest, { recursive: true })
    console.log(`Successfully prepared root build output: ${fallbackSrc} -> ${dest}`)
  }
}
