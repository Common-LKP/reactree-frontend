/**
 * @jest-environment jsdom
 */
import "@testing-library/jest-dom";
import React from "react";
import { fireEvent, render, waitFor } from "@testing-library/react";
import deepCopy from "../../../src/utils/deepCopy";
import getTreeSVG from "../../../src/utils/getTreeSVG";
import Node from "../../../src/utils/Node";
import createNode from "../../../src/utils/reactFiberTree";
import reactree from "../../../src/utils/reactree";
import mockFiberNode from "../../../src/assets/mockFiberNode.json";

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

describe("getTreeSVG", () => {
  const data = {
    name: "Parent",
    children: [{ name: "Child 1" }, { name: "Child 2" }],
  };
  let svg;

  beforeEach(() => {
    svg = getTreeSVG(data, {
      label: d => d.name,
      width: 500,
      height: 500,
    });
  });

  afterEach(() => {
    svg = null;
  });

  it("기본 설정이 적용된 트리 SVG 요소를 반환합니다.", () => {
    expect(svg.tagName).toBe("svg");
    expect(svg.querySelector("circle").getAttribute("r")).toBe("10");
    expect(svg.querySelector("g").getAttribute("stroke")).toBe("#363636");
    expect(svg.querySelector("text").textContent).toBe("Parent");
  });

  it("커스텀 옵션이 적용된 트리 SVG를 반환합니다.", () => {
    const options = {
      width: 500,
      height: 500,
      r: 20,
      fill: "red",
      stroke: "blue",
      strokeWidth: 5,
      label: data => `Node ${data.name}`,
    };
    const customedSVG = getTreeSVG(data, options);

    expect(customedSVG.getAttribute("width")).toBe("500");
    expect(customedSVG.getAttribute("height")).toBe("500");
    expect(customedSVG.querySelector("circle").getAttribute("r")).toBe("20");
    expect(["red", "blue"]).toContain(
      customedSVG.querySelector("circle").getAttribute("fill"),
    );
    expect(customedSVG.querySelector("g").getAttribute("stroke")).toBe("blue");
    expect(customedSVG.querySelector("g").getAttribute("stroke-width")).toBe(
      "5",
    );
    expect(customedSVG.querySelector("text").textContent).toBe("Node Parent");
  });

  it("<circle> 요소가 알맞은 수만큼 렌더링됩니다.", () => {
    const circles = svg.querySelectorAll("circle");

    expect(circles.length).toBe(3);
  });

  it("올바른 라벨 텍스트가 렌더링됩니다.", () => {
    const texts = svg.querySelectorAll("text");

    expect(texts[0].textContent).toBe("Parent");
    expect(texts[1].textContent).toBe("Child 1");
    expect(texts[2].textContent).toBe("Child 2");
  });

  it("트리를 드래그하는 중에는 커서 모양이 'grabbing'으로 바뀝니다.", () => {
    expect(svg.getAttribute("cursor")).toBe("pointer");

    fireEvent.dragStart(svg, { clientX: 0, clientY: 0 });
    setTimeout(() => {
      expect(svg.getAttribute("cursor")).toBe("grabbing");
    }, 0);
  });

  it("트리를 드래그하면 svg요소 viewBox의 width, height는 고정된 채 min-x, min-y 값이 마우스 포인터의 위치에 따라 바뀝니다.", () => {
    const dragEvent = { clientX: 100, clientY: 100 };
    fireEvent.dragStart(svg, { clientX: 0, clientY: 0 });
    fireEvent.drag(svg, dragEvent);
    fireEvent.dragEnd(svg);
    expect(svg.getAttribute("viewBox")).toBe("-250,-50,500,500");
  });

  it("트리를 줌인하면 svg요소 viewBox의 min-x, min-y는 고정된 채 width, height가 작아지고, circle 반지름과 label 간격 및 글자 크기가 커집니다.", () => {
    const zoomEvent = { clientX: 250, clientY: 250, deltaY: 100 };
    fireEvent.wheel(svg, zoomEvent);

    expect(svg.getAttribute("viewBox")).toBe(
      "-250,-50,435.27528164806205,435.27528164806205",
    );
    expect(svg.querySelectorAll("circle")[0].getAttribute("r")).toBe(
      "11.48698354997035",
    );
    expect(svg.querySelectorAll("text")[0].getAttribute("dy")).toBe(
      "1.8730475324955524em",
    );
    expect(svg.querySelectorAll("text")[0].getAttribute("font-size")).toBe(
      "11.48698354997035",
    );
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

  it("첫번째 인자에 유효하지 않은 fiberNode를 입력하면 각 속성값은 undefined 또는 빈 배열 또는 임의의 uuid가 할당됩니다.", () => {
    const invalidInput = { a: 1 };
    createNode(invalidInput, node);

    expect(node.name).toBe(undefined);
    expect(node.props).toEqual([]);
    expect(node.state).toEqual([]);
    expect(node.uuid).toEqual(expect.any(String));
    expect(node.children).toEqual([]);
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

  it("유효한 값을 입력하면 json파일을 다운로드 받는 로직을 실행합니다.", () => {
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
  });
});
