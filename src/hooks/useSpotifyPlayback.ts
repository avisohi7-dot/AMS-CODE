import { useEffect, useState } from 'react'
import { getPlaybackState, pause, play, skipNext, skipPrevious, type SpotifyPlaybackState } from '../lib/spotify'

const POLL_MS = 5000

export function useSpotifyPlayback(enabled: boolean) {
  const [state, setState] = useState<SpotifyPlaybackState | null>(null)

  useEffect(() => {
    if (!enabled) return
    let cancelled = false
    async function poll() {
      try {
        const s = await getPlaybackState()
        if (!cancelled) setState(s)
      } catch {
        // transient network/API hiccup — keep last known state, try again next tick
      }
    }
    poll()
    const interval = setInterval(poll, POLL_MS)
    return () => {
      cancelled = true
      clearInterval(interval)
    }
  }, [enabled])

  function refresh() {
    getPlaybackState()
      .then(setState)
      .catch(() => {})
  }

  async function toggle() {
    if (!state) return
    setState({ ...state, isPlaying: !state.isPlaying })
    try {
      if (state.isPlaying) await pause()
      else await play()
    } catch {
      // ignore — likely no active device; next poll reconciles
    }
  }

  async function next() {
    try {
      await skipNext()
      setTimeout(refresh, 400)
    } catch {
      // ignore — next poll will reconcile
    }
  }

  async function previous() {
    try {
      await skipPrevious()
      setTimeout(refresh, 400)
    } catch {
      // ignore — next poll will reconcile
    }
  }

  return { state, toggle, next, previous, refresh }
}
