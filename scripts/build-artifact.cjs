// Inlines the Vite production build into a single self-contained HTML file
// suitable for the Artifact tool (strict CSP: no external requests, so this
// also drops the Google Fonts <link> — the type scale falls back to its
// system-ui/sans-serif stack, which is already configured in tailwind.config.ts).
const fs = require('fs')
const path = require('path')

const DIST = path.resolve(__dirname, '..', 'dist')
const OUT = path.resolve(__dirname, '..', 'scratch-artifact.html')

const cssFile = fs.readdirSync(path.join(DIST, 'assets')).find((f) => f.endsWith('.css'))
const jsFile = fs.readdirSync(path.join(DIST, 'assets')).find((f) => f.endsWith('.js'))

const css = fs.readFileSync(path.join(DIST, 'assets', cssFile), 'utf8')
const js = fs.readFileSync(path.join(DIST, 'assets', jsFile), 'utf8')

const html = `<title>Focus PT — Scoreboard</title>
<style>
  html, body { background: #12232A; }
</style>
<style>${css}</style>
<div id="root"></div>
<script type="module">
${js}
</script>
`

fs.writeFileSync(OUT, html)
console.log('wrote', OUT, `(${(html.length / 1024).toFixed(0)}kb)`)
