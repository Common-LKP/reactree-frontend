import deepCopy from "../../../src/utils/deepCopy";
import getTreeSVG from "../../../src/utils/getTreeSVG";
import Node from "../../../src/utils/Node";

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

describe("Node", () => {
  let node;

  beforeEach(() => {
    node = new Node();
  });

  it("Node 생성자 함수로 객체를 생성합니다.", () => {
    expect(typeof node).toBe("object");
    expect(node.name).toBe("");
    expect(node.props).toEqual([]);
    expect(node.state).toEqual([]);
    expect(typeof node.uuid).toBe("string");
    expect(node.children).toEqual([]);
  });

  it("child node를 생성합니다.", () => {
    const childNode = new Node();
    node.addChild(childNode);

    expect(node.children).toContain(childNode);
  });

  it("node의 tag에 따라 이름을 할당합니다.", () => {
    for (let i = 0; i <= 24; i += 1) {
      const nodeN = {
        tag: i,
        elementType: {
          name: "funcComponentName",
          _context: {
            displayName: "ContextProvider",
          },
          target: "ForwardRef",
        },
        memoizedProps: "propValue",
      };

      const specificTags = [0, 3, 6, 8, 10, 11, 15];

      if (!specificTags.includes(i)) {
        nodeN.elementType = "div";
      }

      node.setName(nodeN);

      if (nodeN.tag === 0) {
        expect(node.name).toBe("funcComponentName");
      } else if (nodeN.tag === 3) {
        expect(node.name).toBe("root");
      } else if (nodeN.tag === 6) {
        expect(node.name).toBe("propValue");
      } else if (nodeN.tag === 8) {
        expect(node.name).toBe("React.StrictMode");
      } else if (nodeN.tag === 10 && nodeN.elementType) {
        expect(node.name).toBe("ContextProvider");
      } else if (nodeN.tag === 11 && nodeN.elementType) {
        expect(node.name).toBe("ForwardRef");
      } else if (nodeN.tag === 15) {
        expect(node.name).toBe("SimpleMemoComponent");
      } else {
        expect(node.name).toBe("div");
      }
    }
  });

  it("props 속성값을 배열 형태로 할당합니다.", () => {
    const node0 = {
      tag: 0,
      memoizedProps: { prop1: "first", prop2: "second" },
    };
    node.addProps(node0);
    expect(node.props).toEqual(["first", "second"]);
  });

  it("state를 배열 형태로 할당합니다.", () => {
    const node0 = {
      tag: 0,
      memoizedState: {
        memoizedState: "state1",
        next: { memoizedState: "state2", next: null },
      },
    };
    node.addState(node0);
    expect(node.state).toEqual(["state1", "state2"]);
  });
});
