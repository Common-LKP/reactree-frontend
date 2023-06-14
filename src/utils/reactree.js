/* eslint-disable consistent-return */
import deepCopy from "./deepCopy";

const essentialKeys = ["memoizedState", "queue", "value"];

const seen = new WeakSet();

const getCircularReplacer = (key, value) => {
  if (key === "elementType" && typeof value === "function")
    return { name: value.name };

  if (key === "memoizedProps" && typeof value === "object" && value)
    return value;

  if (essentialKeys.includes(key)) return value;

  if (typeof value === "object" && value !== null) {
    if (seen.has(value)) return undefined;

    seen.add(value);
  }

  return value;
};

const reactree = rootInternalRoot => {
  try {
    const fiber = deepCopy(rootInternalRoot);
    const fiberJson = JSON.stringify(fiber.current, getCircularReplacer);
    const blob = new Blob([fiberJson], { type: "text/json;charset=utf-8" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = "data.json";
    link.click();

    setTimeout(() => {
      URL.revokeObjectURL(url);
    }, 0);

    return undefined;
  } catch (error) {
    return console.error(error);
  }
};

export default reactree;
