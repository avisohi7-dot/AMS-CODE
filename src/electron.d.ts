export {}

declare global {
  interface Window {
    electronAPI?: {
      writeWidgetData: (data: unknown) => Promise<void>
      spotifyConnect: (clientId: string) => Promise<boolean>
      spotifyGetAccessToken: () => Promise<string | null>
      spotifyIsConnected: () => Promise<boolean>
      spotifyDisconnect: () => Promise<boolean>
    }
  }
}
