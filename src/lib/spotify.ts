export interface SpotifyPlaybackState {
  trackUri: string
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
    uri: string
    name: string
    duration_ms: number
    artists: SpotifyArtist[]
    album?: { images?: SpotifyImage[] }
  } | null
  device?: { name?: string }
}

export function formatMs(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
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
    trackUri: data.item.uri,
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

export const RECOMMENDED_PLAYLIST_ID = '3ti1CFhBtYmwsYENQmZN3a'

export interface SpotifyPlaylistTrack {
  uri: string
  name: string
  artistName: string
  durationMs: number
}

interface SpotifyPlaylistTracksResponse {
  items: {
    track: {
      uri: string
      name: string
      artists: SpotifyArtist[]
      duration_ms: number
    } | null
  }[]
}

export async function getPlaylistTracks(playlistId: string): Promise<SpotifyPlaylistTrack[]> {
  const res = await authorizedFetch(
    `/playlists/${playlistId}/tracks?limit=20&fields=items(track(uri,name,artists,duration_ms))`
  )
  if (!res.ok) throw new Error(`Spotify API error: ${res.status}`)
  const data = (await res.json()) as SpotifyPlaylistTracksResponse
  return data.items
    .filter((item): item is { track: NonNullable<SpotifyPlaylistTracksResponse['items'][number]['track']> } => !!item.track)
    .map((item) => ({
      uri: item.track.uri,
      name: item.track.name,
      artistName: item.track.artists.map((a) => a.name).join(', '),
      durationMs: item.track.duration_ms,
    }))
}

export async function playTrackInPlaylist(playlistId: string, trackUri: string): Promise<void> {
  await authorizedFetch('/me/player/play', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ context_uri: `spotify:playlist:${playlistId}`, offset: { uri: trackUri } }),
  })
}
