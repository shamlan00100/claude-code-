const { chromium } = require('playwright')
const path = require('path')
const fs = require('fs')

const BASE = process.env.BASE_URL || 'http://127.0.0.1:5183'
const OUT = path.resolve(__dirname, '..', 'screenshots')
fs.mkdirSync(OUT, { recursive: true })

const routes = [
  ['home', '/'],
  ['today', '/app/today'],
  ['set-logger', '/app/log'],
  ['snap-meal', '/app/meals'],
  ['progress', '/app/progress'],
  ['review-queue', '/coach/queue'],
  ['client-roster', '/coach/roster'],
  ['program-builder', '/coach/programs'],
  ['components', '/components'],
]

;(async () => {
  const only = process.argv[2]
  // This sandbox pins a Chromium build that doesn't match the local
  // `playwright` package's expected revision, so point at it explicitly
  // rather than `npx playwright install` (blocked in this environment).
  // Unset PW_EXECUTABLE_PATH to let Playwright resolve its own browser.
  const executablePath = process.env.PW_EXECUTABLE_PATH || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome'
  const browser = await chromium.launch(fs.existsSync(executablePath) ? { executablePath } : {})
  const page = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 })

  for (const [name, route] of routes) {
    if (only && name !== only) continue
    const url = route === '/' ? BASE + '/' : BASE + '/#' + route
    await page.goto(url, { waitUntil: 'load', timeout: 15000 })
    await page.waitForTimeout(400)
    const fullPage = name === 'components' || name === 'home'
    await page.screenshot({ path: path.join(OUT, `${name}.png`), fullPage })
    console.log('shot', name)
  }

  await browser.close()
})()
