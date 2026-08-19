const { shell, safeStorage, app, ipcMain } = require('electron')
const http = require('node:http')
const crypto = require('node:crypto')
const path = require('node:path')
const fs = require('node:fs')

const REDIRECT_PORT = 17654
const REDIRECT_URI = `http://127.0.0.1:${REDIRECT_PORT}/callback`
const SCOPES = 'user-read-playback-state user-modify-playback-state user-read-currently-playing'
const TOKEN_ENDPOINT = 'https://accounts.spotify.com/api/token'
const AUTHORIZE_ENDPOINT = 'https://accounts.spotify.com/authorize'

function tokenFilePath() {
  return path.join(app.getPath('userData'), 'spotify-tokens.enc')
}

function base64url(buffer) {
  return buffer.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function generateVerifier() {
  return base64url(crypto.randomBytes(64))
}

function generateChallenge(verifier) {
  const hash = crypto.createHash('sha256').update(verifier).digest()
  return base64url(hash)
}

function saveTokens(tokens) {
  const json = JSON.stringify(tokens)
  const filePath = tokenFilePath()
  fs.mkdirSync(path.dirname(filePath), { recursive: true })
  if (safeStorage.isEncryptionAvailable()) {
    fs.writeFileSync(filePath, safeStorage.encryptString(json))
  } else {
    fs.writeFileSync(filePath, json, 'utf-8')
  }
}

function loadTokens() {
  const filePath = tokenFilePath()
  if (!fs.existsSync(filePath)) return null
  try {
    const raw = fs.readFileSync(filePath)
    const json = safeStorage.isEncryptionAvailable() ? safeStorage.decryptString(raw) : raw.toString('utf-8')
    return JSON.parse(json)
  } catch {
    return null
  }
}

function clearTokens() {
  const filePath = tokenFilePath()
  if (fs.existsSync(filePath)) fs.unlinkSync(filePath)
}

async function exchangeCodeForTokens(clientId, code, verifier) {
  const body = new URLSearchParams({
    client_id: clientId,
    grant_type: 'authorization_code',
    code,
    redirect_uri: REDIRECT_URI,
    code_verifier: verifier,
  })
  const res = await fetch(TOKEN_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  })
  if (!res.ok) throw new Error(`Spotify token exchange failed: ${res.status}`)
  const data = await res.json()
  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresAt: Date.now() + data.expires_in * 1000,
    clientId,
  }
}

async function refreshTokens(stored) {
  const body = new URLSearchParams({
    client_id: stored.clientId,
    grant_type: 'refresh_token',
    refresh_token: stored.refreshToken,
  })
  const res = await fetch(TOKEN_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  })
  if (!res.ok) throw new Error(`Spotify token refresh failed: ${res.status}`)
  const data = await res.json()
  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token || stored.refreshToken,
    expiresAt: Date.now() + data.expires_in * 1000,
    clientId: stored.clientId,
  }
}

// Briefly runs a loopback HTTP server to catch Spotify's OAuth redirect,
// since a desktop app has no https origin of its own to redirect back to.
function waitForCallback() {
  return new Promise((resolve, reject) => {
    const server = http.createServer((req, res) => {
      const url = new URL(req.url, REDIRECT_URI)
      if (url.pathname !== '/callback') {
        res.writeHead(404)
        res.end()
        return
      }
      const code = url.searchParams.get('code')
      const error = url.searchParams.get('error')
      res.writeHead(200, { 'Content-Type': 'text/html' })
      res.end(
        error
          ? '<html><body style="font-family:sans-serif;background:#0d0d0d;color:#fff;text-align:center;padding-top:80px"><h2>Spotify connection failed</h2><p>You can close this tab and try again.</p></body></html>'
          : '<html><body style="font-family:sans-serif;background:#0d0d0d;color:#fff;text-align:center;padding-top:80px"><h2>Spotify connected</h2><p>You can close this tab and go back to Second Brain OS.</p></body></html>'
      )
      server.close()
      if (error) reject(new Error(error))
      else if (code) resolve(code)
      else reject(new Error('No code returned'))
    })
    server.on('error', reject)
    server.listen(REDIRECT_PORT, '127.0.0.1')

    setTimeout(() => {
      server.close()
      reject(new Error('Spotify login timed out'))
    }, 120000)
  })
}

async function connect(clientId) {
  const verifier = generateVerifier()
  const challenge = generateChallenge(verifier)

  const authUrl = new URL(AUTHORIZE_ENDPOINT)
  authUrl.searchParams.set('client_id', clientId)
  authUrl.searchParams.set('response_type', 'code')
  authUrl.searchParams.set('redirect_uri', REDIRECT_URI)
  authUrl.searchParams.set('code_challenge_method', 'S256')
  authUrl.searchParams.set('code_challenge', challenge)
  authUrl.searchParams.set('scope', SCOPES)

  const callbackPromise = waitForCallback()
  await shell.openExternal(authUrl.toString())
  const code = await callbackPromise
  const tokens = await exchangeCodeForTokens(clientId, code, verifier)
  saveTokens(tokens)
}

async function getAccessToken() {
  let stored = loadTokens()
  if (!stored) return null
  if (Date.now() > stored.expiresAt - 60000) {
    stored = await refreshTokens(stored)
    saveTokens(stored)
  }
  return stored.accessToken
}

function registerSpotifyHandlers() {
  ipcMain.handle('spotify:connect', async (_event, clientId) => {
    await connect(clientId)
    return true
  })
  ipcMain.handle('spotify:get-access-token', () => getAccessToken())
  ipcMain.handle('spotify:is-connected', () => loadTokens() !== null)
  ipcMain.handle('spotify:disconnect', () => {
    clearTokens()
    return true
  })
}

module.exports = { registerSpotifyHandlers, REDIRECT_URI }
