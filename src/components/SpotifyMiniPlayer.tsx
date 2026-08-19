import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronDown, ChevronUp, Music, Pause, Play, SkipBack, SkipForward, Volume2 } from 'lucide-react'
import { useSpotifyConnected } from '../hooks/useSpotifyConnected'
import { useSpotifyPlayback } from '../hooks/useSpotifyPlayback'
import { formatMs, getPlaylistTracks, playTrackInPlaylist, RECOMMENDED_PLAYLIST_ID, type SpotifyPlaylistTrack } from '../lib/spotify'

export function SpotifyMiniPlayer() {
  const connected = useSpotifyConnected()
  const { state, toggle, next, previous, refresh } = useSpotifyPlayback(connected === true)
  const [tracksOpen, setTracksOpen] = useState(false)
  const [tracks, setTracks] = useState<SpotifyPlaylistTrack[] | null>(null)
  const [tracksError, setTracksError] = useState(false)

  if (connected !== true) return null

  async function openTracks() {
    const nextOpen = !tracksOpen
    setTracksOpen(nextOpen)
    if (nextOpen && !tracks) {
      try {
        const list = await getPlaylistTracks(RECOMMENDED_PLAYLIST_ID)
        setTracks(list)
      } catch {
        setTracksError(true)
      }
    }
  }

  async function playTrack(uri: string) {
    try {
      await playTrackInPlaylist(RECOMMENDED_PLAYLIST_ID, uri)
      setTimeout(refresh, 400)
    } catch {
      // ignore — next poll reconciles
    }
  }

  return (
    <div className="mb-3 rounded-lg border border-line-border px-2.5 py-2">
      {state?.albumArt ? (
        <img src={state.albumArt} alt="" className="aspect-square w-full rounded-md object-cover" />
      ) : (
        <div className="flex aspect-square w-full items-center justify-center rounded-md bg-surface-plane text-ink-muted">
          <Music size={28} />
        </div>
      )}

      <div className="mt-2 min-w-0">
        <p className="truncate text-sm font-semibold text-ink-primary">{state?.trackName ?? 'Nothing playing'}</p>
        <p className="truncate text-xs text-ink-muted">{state?.artistName ?? 'Spotify'}</p>
      </div>

      <div className="mt-2 flex items-center justify-center gap-5">
        <button type="button" onClick={previous} aria-label="Previous" className="text-ink-secondary hover:text-ink-primary">
          <SkipBack size={16} />
        </button>
        <button
          type="button"
          onClick={toggle}
          disabled={!state}
          aria-label={state?.isPlaying ? 'Pause' : 'Play'}
          className="flex h-8 w-8 items-center justify-center rounded-full disabled:opacity-40"
          style={{ backgroundColor: 'var(--brand-accent)', color: 'var(--brand-accent-ink)' }}
        >
          {state?.isPlaying ? <Pause size={15} /> : <Play size={15} />}
        </button>
        <button type="button" onClick={next} aria-label="Next" className="text-ink-secondary hover:text-ink-primary">
          <SkipForward size={16} />
        </button>
      </div>

      <button
        type="button"
        onClick={openTracks}
        className="mt-2 flex w-full items-center justify-center gap-1 text-[11px] text-ink-secondary hover:text-ink-primary"
      >
        Playlist
        {tracksOpen ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
      </button>

      {tracksOpen && (
        <div className="mt-2 border-t border-line-hairline pt-2">
          <p className="mb-1 px-1 text-[10px] font-semibold uppercase tracking-wide text-ink-muted">Playlist</p>
          {tracksError ? (
            <p className="px-1 text-[11px] text-ink-muted">Couldn't load playlist.</p>
          ) : !tracks ? (
            <p className="px-1 text-[11px] text-ink-muted">Loading…</p>
          ) : (
            <ul className="max-h-72 overflow-y-auto">
              {tracks.map((t, i) => {
                const active = state?.trackUri === t.uri
                return (
                  <li key={t.uri}>
                    <button
                      type="button"
                      onClick={() => playTrack(t.uri)}
                      className="group flex w-full items-center gap-2 rounded px-1 py-1.5 text-left hover:bg-surface-plane"
                    >
                      <span className="flex w-4 shrink-0 items-center justify-center">
                        {active ? (
                          <Volume2 size={11} style={{ color: 'var(--brand-accent)' }} />
                        ) : (
                          <>
                            <span className="text-[10px] text-ink-muted group-hover:hidden">{i + 1}</span>
                            <Play size={9} className="hidden text-ink-primary group-hover:block" />
                          </>
                        )}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p
                          className="truncate text-[11px] font-medium"
                          style={{ color: active ? 'var(--brand-accent)' : 'var(--text-primary)' }}
                        >
                          {t.name}
                        </p>
                        <p className="truncate text-[10px] text-ink-muted">{t.artistName}</p>
                      </div>
                      <span className="tabular shrink-0 text-[10px] text-ink-muted">{formatMs(t.durationMs)}</span>
                    </button>
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      )}

      <Link to="/widgets" className="mt-1 block text-center text-[10px] text-ink-muted hover:text-ink-secondary">
        Open Spotify widget
      </Link>
    </div>
  )
}
