const { contextBridge, ipcRenderer } = require("electron");
window.ipcRenderer = require("electron").ipcRenderer;

contextBridge.exposeInMainWorld("electronAPI", {
  openFileDialog: () => ipcRenderer.invoke("get-path"),
  sendTreeData: data => ipcRenderer.send("send-node-data", data),
  getTreeData: data => ipcRenderer.on("get-node-data", data),
});
