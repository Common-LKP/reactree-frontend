const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  openFileDialog: () => ipcRenderer.invoke("get-path"),
  getNodeData: callback => ipcRenderer.on("get-node-data", callback),
  sendFilePath: path => ipcRenderer.on("send-file-path", path),
});
