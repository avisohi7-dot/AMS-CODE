export {}

declare global {
  interface Window {
    electronAPI?: {
      writeWidgetData: (data: unknown) => Promise<void>
    }
  }
}
