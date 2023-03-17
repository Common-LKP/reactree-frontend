const { contextBridge, ipcRenderer } = require("electron");
window.ipcRenderer = require("electron").ipcRenderer;

contextBridge.exposeInMainWorld("electronAPI", {
  openFileDialog: () => ipcRenderer.invoke("get-path"),
  treeData: () => ipcRenderer.invoke("treeData").then(result => result),
});
