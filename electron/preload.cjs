const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
  writeWidgetData: (data) => ipcRenderer.invoke('write-widget-data', data),
  spotifyConnect: (clientId) => ipcRenderer.invoke('spotify:connect', clientId),
  spotifyGetAccessToken: () => ipcRenderer.invoke('spotify:get-access-token'),
  spotifyIsConnected: () => ipcRenderer.invoke('spotify:is-connected'),
  spotifyDisconnect: () => ipcRenderer.invoke('spotify:disconnect'),
})
