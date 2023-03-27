import deepCopy from "./deepCopy";

const seen = new WeakSet();

const getCircularReplacer = (key, value) => {
  if (key === "elementType" && typeof value === "function")
    return { name: value.name };

  if (key === "memoizedProps" && typeof value === "object" && value)
    return value;

  if (typeof value === "object" && value !== null) {
    if (seen.has(value)) return undefined;

    seen.add(value);
  }

  return value;
};

const reactree = rootInternalRoot => {
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
};

export default reactree;
