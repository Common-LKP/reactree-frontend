/* eslint-disable no-continue */
/* eslint-disable no-prototype-builtins */
/* eslint-disable no-restricted-syntax */
function deepCopy(object) {
  const result = {};

  for (const key in object) {
    if (!object.hasOwnProperty(key)) continue;

    if (key === "child") {
      result[key] = deepCopy(object[key]);
    } else {
      result[key] = object[key];
    }
  }

  return result;
}

export default deepCopy;
