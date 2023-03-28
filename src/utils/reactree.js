/* eslint-disable consistent-return */
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
  try {
    // eslint-disable-next-line no-alert
    const userConsent = window.confirm(
      "React 트리 데이터가 포함된 JSON 파일이 다운로드됩니다. 계속 진행하시겠습니까? \n *파일은 트리를 그린 후 삭제됩니다.*",
    );

    if (!userConsent) return;

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
