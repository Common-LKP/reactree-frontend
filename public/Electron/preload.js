const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  openFileDialog: async () => {
    const result = await ipcRenderer.invoke("get-path");
    return result;
  },
  loadURLInBrowser: url => {
    ipcRenderer.send("load-url", url);
  },
});
