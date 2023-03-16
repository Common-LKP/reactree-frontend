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
  loadURLInBrowser: url => {
    try {
      ipcRenderer.send("load-url", url);
    } catch (error) {
      console.error("Error in loadURLInBrowser:", error);
    }
  },
});
