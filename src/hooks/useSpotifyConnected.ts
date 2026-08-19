import { useEffect, useState } from 'react'

export function useSpotifyConnected(): boolean | null {
  const [connected, setConnected] = useState<boolean | null>(null)
  const available = typeof window !== 'undefined' && !!window.electronAPI

  useEffect(() => {
    if (!available) {
      setConnected(false)
      return
    }
    window.electronAPI!.spotifyIsConnected().then(setConnected)
  }, [available])

  return connected
}
