export interface SpotifyPlaybackState {
  isPlaying: boolean
  trackName: string
  artistName: string
  albumArt: string | null
  progressMs: number
  durationMs: number
  deviceName: string | null
}

interface SpotifyArtist {
  name: string
}

interface SpotifyImage {
  url: string
}

interface SpotifyPlayerResponse {
  is_playing: boolean
  progress_ms: number | null
  item: {
    name: string
    duration_ms: number
    artists: SpotifyArtist[]
    album?: { images?: SpotifyImage[] }
  } | null
  device?: { name?: string }
}

async function authorizedFetch(path: string, init?: RequestInit): Promise<Response> {
  const token = await window.electronAPI?.spotifyGetAccessToken()
  if (!token) throw new Error('Not connected to Spotify')
  return fetch(`https://api.spotify.com/v1${path}`, {
    ...init,
    headers: {
      ...(init?.headers ?? {}),
      Authorization: `Bearer ${token}`,
    },
  })
}

export async function getPlaybackState(): Promise<SpotifyPlaybackState | null> {
  const res = await authorizedFetch('/me/player')
  if (res.status === 204 || res.status === 404) return null
  if (!res.ok) throw new Error(`Spotify API error: ${res.status}`)
  const data = (await res.json()) as SpotifyPlayerResponse
  if (!data?.item) return null
  return {
    isPlaying: data.is_playing,
    trackName: data.item.name,
    artistName: data.item.artists.map((a) => a.name).join(', '),
    albumArt: data.item.album?.images?.[0]?.url ?? null,
    progressMs: data.progress_ms ?? 0,
    durationMs: data.item.duration_ms,
    deviceName: data.device?.name ?? null,
  }
}

export async function play(): Promise<void> {
  await authorizedFetch('/me/player/play', { method: 'PUT' })
}

export async function pause(): Promise<void> {
  await authorizedFetch('/me/player/pause', { method: 'PUT' })
}

export async function skipNext(): Promise<void> {
  await authorizedFetch('/me/player/next', { method: 'POST' })
}

export async function skipPrevious(): Promise<void> {
  await authorizedFetch('/me/player/previous', { method: 'POST' })
}
