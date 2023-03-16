const getElementByIdAsync = id =>
  new Promise(resolve => {
    const getElement = () => {
      const element = document.getElementById(id);
      if (element) {
        resolve(element);
      } else {
        requestAnimationFrame(getElement);
      }
    };

    getElement();
  });

document.addEventListener("DOMContentLoaded", async () => {
  const buttonElement = await getElementByIdAsync("directoryButton");
  buttonElement.addEventListener("click", async () => {
    try {
      const url = await window.electronAPI.openFileDialog();
      if (url) {
        window.electronAPI.loadURLInBrowser(url);
      }
    } catch (error) {
      console.error("Error in loadURLInBrowser");
    }
  });
});
