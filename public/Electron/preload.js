const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  openFileDialog: async () => {
    try {
      const result = await ipcRenderer.invoke("get-path");

      return result;
    } catch (error) {
      return console.error("Error in openFileDialog:", error);
    }
  },
});

contextBridge.exposeInMainWorld("TreeAPI", {
  treeData: () => ipcRenderer.invoke("treeData"),
});
