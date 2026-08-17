const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
  writeWidgetData: (data) => ipcRenderer.invoke('write-widget-data', data),
})
