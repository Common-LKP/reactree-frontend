const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  openFileDialog: () => ipcRenderer.invoke("get-path"),
  sendNodeData: data => ipcRenderer.send("send-node-data", data),
  getNodeData: callback => ipcRenderer.on("get-node-data", callback),
  fiberData: callback => ipcRenderer.on("send-fiberData", callback),
  commandData: () => ipcRenderer.invoke("npmStartButton"),
  sendFilePath: path => ipcRenderer.on("send-file-path", path),
});
