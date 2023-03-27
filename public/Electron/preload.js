const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  openFileDialog: () => ipcRenderer.invoke("get-path"),
  getNodeData: callback => ipcRenderer.on("get-node-data", callback),
  commandData: () => ipcRenderer.invoke("npmStartButton"),
  sendFilePath: path => ipcRenderer.on("send-file-path", path),
});
