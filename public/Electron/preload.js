const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  openFileDialog: () => ipcRenderer.invoke("get-path"),
  fiberData: callback => ipcRenderer.on("send-fiberData", callback),
  commandData: inputValue => ipcRenderer.invoke("commandInput", inputValue),
  sendFilePath: path => ipcRenderer.on("send-file-path", path),
});
