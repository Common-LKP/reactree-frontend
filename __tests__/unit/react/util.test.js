import deepCopy from "../../../src/utils/deepCopy";
import getTreeSVG from "../../../src/utils/getTreeSVG";
import Node from "../../../src/utils/Node";
import createNode from "../../../src/utils/reactFiberTree";
import mockFiberNode from "../../../src/assets/mockFiberNode.json";
import reactree from "../../../src/utils/reactree";
import { JSDOM } from "jsdom";

describe("deeCopy", () => {
  it("null을 입력하면 빈 객체를 반환합니다.", () => {
    const result = deepCopy(null);

    expect(result).toBeInstanceOf(Object);
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
    expect(node).toBeInstanceOf(Object);
    expect(node.name).toBe("");
    expect(node.props).toEqual([]);
    expect(node.state).toEqual([]);
    expect(node.uuid).toEqual(expect.any(String));
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

describe("createNode", () => {
  let node;

  beforeEach(() => {
    node = new Node();
  });

  it("함수 첫번째 인자가 null일 때, 두번째 인자의 내부 속성 및 속성값은 변하지 않습니다.", () => {
    createNode(null, node);
    expect(node).toEqual(node);

    createNode({}, node);
    expect(node).toEqual(node);
  });

  it("첫번째 인자에 유효한 fiberNode를 입력하면 node가 유효한 트리 객체가 됩니다.", () => {
    createNode(mockFiberNode, node);
    const expectedTree = {
      name: expect.any(String),
      props: expect.any(Array),
      state: expect.any(Array),
      uuid: expect.any(String),
      children: expect.any(Array),
    };

    expect(node).toBeInstanceOf(Object);
    expect(node).toMatchObject(expectedTree);
  });
});

describe("reactree", () => {
  it("함수의 반환값은 항상 undefined 입니다.", () => {
    expect(reactree()).toBe(undefined);
    expect(reactree({})).toBe(undefined);
    expect(reactree({ a: 1 })).toBe(undefined);
  });

  it("유효하지 않은 값을 입력하면 console.error()가 실행됩니다.", () => {
    const consoleErrorSpy = jest.spyOn(console, "error");
    const invalidRoot = {};
    reactree(invalidRoot);

    expect(consoleErrorSpy).toHaveBeenCalledWith(expect.any(Error));

    consoleErrorSpy.mockRestore();
  });

  it("유효한 값을 입력하면 json파일을 다운로드 받는 로직을 실행합니다.", () => {
    const jsdom = new JSDOM("<!doctype html><html><body></body></html>");
    global.document = jsdom.window.document;

    const createElementSpy = jest
      .spyOn(document, "createElement")
      .mockReturnValueOnce({
        href: "",
        download: "",
        click: jest.fn(),
      });
    const stringifySpy = jest.spyOn(JSON, "stringify");

    reactree({ current: {} });

    expect(stringifySpy).toHaveBeenCalledWith(
      expect.any(Object),
      expect.any(Function),
    );
    const mockFiberJson = stringifySpy.mock.results[0].value;
    expect(createElementSpy).toHaveBeenCalledWith("a");
    expect(createElementSpy.mock.results[0].value.href).toBe(
      `data:text/json;charset=utf-8,${mockFiberJson}`,
    );
    expect(createElementSpy.mock.results[0].value.download).toBe("data.json");
    expect(createElementSpy.mock.results[0].value.click).toHaveBeenCalled();

    createElementSpy.mockRestore();
    stringifySpy.mockRestore();
    jsdom.window.close();
  });
});
