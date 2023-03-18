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
      await window.electronAPI.openFileDialog();
    } catch (error) {
      console.error(error);
    }
  });
});

document.addEventListener("DOMContentLoaded", async () => {
  const inputElement = await getElementByIdAsync("commandInput");
  inputElement.addEventListener("keydown", async event => {
    try {
      if (event.key === "Enter") {
        const inputValue = event.target.value;
        await window.electronAPI.commandData(inputValue);
      }
    } catch (error) {
      console.error(error);
    }
  });
});
