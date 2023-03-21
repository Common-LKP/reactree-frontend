import deepCopy from "./deepCopy";

const seen = new WeakSet();

const getCircularReplacer = (key, value) => {
  if (key === "elementType" && typeof value === "function")
    return { name: value.name };

  if (typeof value === "object" && value !== null) {
    if (seen.has(value)) return undefined;

    seen.add(value);
  }

  return value;
};

const reactree = root => {
  try {
    const fiber = deepCopy(root);
    const fiberJson = JSON.stringify(fiber.current, getCircularReplacer);
    const link = document.createElement("a");
    const jsonString = `data:text/json;charset=utf-8,${fiberJson}`;

    link.href = jsonString;
    link.download = "data.json";
    link.click();

    return undefined;
  } catch (error) {
    return console.error(error);
  }
};

export default reactree;
