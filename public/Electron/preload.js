const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  openDialog: () => ipcRenderer.invoke("open-dialog"),
  getFilePath: callback => ipcRenderer.on("path-to-react", callback),
  getNodeData: callback => ipcRenderer.on("node-to-react", callback),
});
