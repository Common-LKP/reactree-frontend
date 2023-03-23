import deepCopy from "../../../src/utils/deepCopy";
import getTreeSVG from "../../../src/utils/getTreeSVG";

describe("deeCopy", () => {
  it("null을 입력하면 빈 객체를 반환합니다.", () => {
    const result = deepCopy(null);

    expect(typeof result).toBe("object");
    expect(result).toEqual({});
  });

  it("child 속성이 있는 객체를 입력하면 child 속성값이 깊은 복사된 객체를 반환합니다.", () => {
    const mockData = {
      tag: 1,
      child: {
        tag: 2,
        child: {
          tag: 3,
        },
      },
    };
    const result = deepCopy(mockData);
    mockData.child.tag = "new value";

    expect(result).not.toEqual(mockData);
  });

  it("child 속성이 없는 객체를 입력하면 얕은 복사된 객체를 반환합니다.", () => {
    const mockData = {
      tag: 1,
      notChild: {
        tag: 2,
        notChild: {
          tag: 3,
        },
      },
    };
    const result = deepCopy(mockData);
    mockData.notChild.tag = "new value";

    expect(result).toEqual(mockData);
  });
});

describe.skip("getTreeSVG", () => {
  it("null을 입력하면 null을 반환합니다.", () => {
    expect(getTreeSVG(null)).toBe(null);
  });
});
