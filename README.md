# Reactree

<div align=center>

### _" React + Tree "_
**리액트** 프로젝트의 컴포넌트 계층 구조를 **트리** 구조로 시각화해주는 앱 서비스입니다.

</div>

<br>

# Table of Contents

- [Preview](#Preview)
- [Motivation](#Motivation)
- [Challenges](#Challenges)
  - [1. 사용자 코드를 어떻게 파싱할까?](#1-사용자-코드를-어떻게-파싱할까)
    - [React Fiber에서 데이터 추출하기](#react-fiber에서-데이터-추출하기)
  - [2. 일렉트론 앱 내부 함수를 사용자 디렉토리에서 어떻게 실행시킬 수 있을까?](#2-일렉트론-앱-내부-함수를-사용자-디렉토리에서-어떻게-실행시킬-수-있을까)
    - [SymLink를 통해 사용자 디렉토리에서 reactree 함수에 접근하기](#symlink를-통해-사용자-디렉토리에서-reactree-함수에-접근하기)
  - [3. 사용자 디렉토리에서 rootFiberNode를 어떻게 전송할 수 있을까?](#3-사용자-디렉토리에서-rootfibernode를-어떻게-전송할-수-있을까)
- [Tech stack](#Tech-stack)
- [Features](#Features)
- [Timeline](#Timeline)

<br>

# Preview

🔽 폴더 선택 후 트리구조 렌더링
![reactreeGIF1](https://user-images.githubusercontent.com/50537876/228586806-b776bc89-8750-49f8-8a9d-8f969f12b7a7.gif)
<br><br>
🔽 트리구조 줌인/줌아웃, 슬라이더바 조절, 노드 마우스 이벤트(호버링, 클릭)
![reactreeGIF2](https://user-images.githubusercontent.com/50537876/228586858-d02b2f78-151e-4ee9-b837-433cb2b20b17.gif)

<br>

# Motivation

리액트 공부를 시작했을 때 또는 다른 사람이 만든 리액트 프로젝트 코드를 처음 읽을 때, 전체적인 컴포넌트 구조를 이해하는 데 시간이 걸렸습니다.
‘렌더링된 컴포넌트의 구조를 시각화해서 같이 보여준다면 리액트로 개발하는 것에 더 도움이 되지 않을까’ 라는 생각으로 이 프로젝트를 시작하게 되었습니다.

<br>

# Challenges

## 1. 사용자 코드를 어떻게 파싱할까?

### 시도한 방법

#### Github에 API요청을 보내서 코드를 문자열로 받기
  ```js
  // github repo 정보를 받아오는 api
  async function getGit (owner, repo, path) {
    const data = await fetch (
      `https://api.github.com/repos/${owner}/${repo}/contents/${path}`
      )
      .then (d => d.json ())
      .then (d =>
        fetch (`https://api.github.com/repos/${owner}/${repo}/git/blobs/${d.sha}`)
      )
      .then (d => d.json ())
      .then (d => console.log(atob (d.content)));

    return data;
  }

  getGit("pmjuu", "my-workout-manager", "src/App.js");
  ```
  🔽 콘솔 결과물 - 실제 Repo에 있는 파일 코드를 문자열로 받아오는 것이 가능했습니다.
  <img src="https://github.com/pmjuu/climick-client/assets/50537876/337ff9d6-2811-4436-a010-94570bc7d621" width=400><br>

* 외부 library 없이 문자열을 javascript 문법으로 파싱하기에는 경우의 수가 너무 많아서, 제한시간 내에 구현하기는 힘들다고 판단했습니다.

#### ReactDOMServer Object 활용하기
  ```js
  import React from "react";
  import ReactDOMServer from "react-dom/server";

  // 확인하고 싶은 컴포넌트
  const MyComponent = () => {
    return (
      <div>
        <h1>Hello, world!</h1>
        <p>This is my component.</p>
      </div>
    );
  };

  // 컴포넌트를 HTML로 렌더링한다.
  const html = ReactDOMServer.renderToString(<MyComponent />);

  // HTML에서 DOM Tree를 추출해서 시각화한다
  const parser = new DOMParser();
  const dom = parser.parseFromString(html, "text/html");
  const tree = dom.body.firstChild;

  console.log(tree);
  ```
  <img src="https://github.com/pmjuu/climick-client/assets/50537876/ab1b7c1d-bfb3-4c2e-ad7c-f245afd90041" width=300><br>

* ReactDOMServer 객체를 사용하여 컴포넌트를 정적 마크업으로 렌더링할 수 있습니다.
* 그런데 Component 또한 일반 태그로 출력돼서 Component 이름을 별도로 추출할 수 있는 작업이 필요했습니다.

#### `React.Children` 속성 활용하기
  ```js
  function buildTree(components) {
    const tree = {
      name: "App",
      children: [],
    }

    React.Children.forEach(components, (component) => {
      if (React.isValidElement(component)) {
        const child = {
          name: component.type.name,
          children: buildTree(component.props.children),
        };
        tree.children.push(child);
      }
    });

    return tree.children.length ? tree.children : null;
  }
  ```
* Component의 이름을 추출해 계층구조 시각화는 할 수 있었습니다.
* 그러나 App Component의 `return` 구문 내에 선언된 Component에만 국한되는 문제가 있었습니다. <br>
  (일반 태그들은 표시되지 않음.)
* 또한 Conditional Rendering에 대해서 추가적인 로직이 필요했습니다.

#### react-d3-tree package 사용하기
* react-d3-tree 패키지를 사용해 DOM Tree를 파싱하고 Tree 구조를 생성할 수 있었습니다.
* 그러나 프로젝트 메인 로직의 패키지에 대한 의존성이 커서 기술적 챌린지가 부족하고 커스터마이징이 어려웠습니다.
  <details>
    <summary>코드</summary>

    ```js
    import React, { useState, useEffect } from "react";
    import Tree from "react-d3-tree";

    function DOMTree() {
      const [treeData, setTreeData] = useState({});

      useEffect(() => {
        // DOM Tree의 root element를 변수에 할당
        const rootElement = document.documentElement;

        // DOM Tree를 파싱해서 생성하려는 tree 데이터 구조 생성
        function createTree(node) {
          const tree = {};
          tree.name = node.tagName.toLowerCase();
          tree.children = [];

          for (let i = 0; i < node.children.length; i++) {
            const child = node.children[i];
            const childTree = createTree(child);
            tree.children.push(childTree);
          }

          return tree;
        }

        const treeData = createTree(rootElement);
        setTreeData(treeData);
      }, []);

      return (
        <div id="treeWrapper" style={{ width: "159%", height: "100vh" }}>
          <Tree data={treeData} />
        </div>
      );
    }
    ```
  </details>

  <img width=300 src="https://github.com/pmjuu/climick-client/assets/50537876/ca17a12b-d3db-498e-af4d-d7a85ca90e4a">

### 결론

* 코드 파싱이 아니라 현재 화면에 렌더링된 컴포넌트 정보를 아용합니다.<br>
    -> **React Fiber** 활용하기
* 사용자의 로컬 디렉토리에서 `npm start`를 실행시켜서 localhost에서 렌더링된 화면을 일렉트론 view로 보여줍니다.<br>
    -> **Electron** 앱에서 `child_process` 활용하기

### React Fiber란?

* React v16 에서 리액트의 핵심 알고리즘을 재구성한 새로운 재조정(Reconciliation) 알고리즘입니다.
* 모든 작업을 동기적으로 실행하던 기존의 stack reconciler의 단점을 보완하여 concurrency가 가능해집니다.
* 특정 작업에 우선순위를 매겨 작업의 일부분을 concurrent하게 일시정지, 재가동 할 수 있게 하여 incremental rendering이 가능합니다.

#### Fiber의 구조

* fiber는 컴포넌트 및 컴포넌트의 입력과 출력에 대한 정보를 포함한 자바스크립트 객체입니다.
* `current`, `workInProgress` 2개의 트리 구조로 구성됩니다.
* 각 `fiberNode`가 `return`, `child`, `sibiling` 포인터 값으로 자신의 다음 노드를 가리키는, 단일 연결리스트 형태를 띄고 있습니다.

### React Fiber에서 데이터 추출하기

* `d3.js`를 통해 컴포넌트 구조를 시각화하려면 데이터를 트리 구조 형태로 만들어야 했습니다.
* 연결리스트 형태인 fiber를 트리 구조로 바꾸기 위해 재귀함수 `createNode()`를 만들어서 컴포넌트 트리 구조 데이터를 추출했습니다.
  ```js
  import TreeNode from "./TreeNode";

  const skipTag = [7, 9, 10, 11];

  function createNode(fiberNode, parentTree) {
    if (!fiberNode || Object.keys(fiberNode).length === 0) return null;

    const node = fiberNode.alternate ? fiberNode.alternate : fiberNode;
    const tree = new TreeNode();

    tree.setName(node);
    tree.addProps(node);
    tree.addState(node);

    if (fiberNode.sibling) {
      while (skipTag.includes(fiberNode.sibling.tag)) {
        const originSibling = fiberNode.sibling.sibling;
        fiberNode.sibling = fiberNode.sibling.child;
        fiberNode.sibling.sibling = originSibling;
      }

      const siblingTree = createNode(fiberNode.sibling, parentTree);

      if (siblingTree) {
        parentTree.addChild(siblingTree);
      }
    }

    if (fiberNode.child) {
      while (skipTag.includes(fiberNode.child.tag)) {
        fiberNode.child = fiberNode.child.child;
      }

      const childTree = createNode(fiberNode.child, tree);

      tree.addChild(childTree);
    }

    return tree;
  }
  ```
* 각 노드는 `tag`로 구분되는데, 데이터 추출 과정에서 `tag`를 기준으로 트리 구조 시각화에 불필요한 노드는 제외시켰습니다.
* 순환참조를 일으키는 속성이 다수 존재합니다. <br>
  이 때문에 json파일 생성과정에서 `JSON.stringify()`를 실행할 수 없었기에 순환참조 속성은 제외시켰습니다.<br>
  🔽 fiberNode tag 분류
  ```js
  export const FunctionComponent = 0;
  export const ClassComponent = 1;
  export const IndeterminateComponent = 2; // Before we know whether it is function or class
  export const HostRoot = 3; // Root of a host tree. Could be nested inside another node.
  export const HostPortal = 4; // A subtree. Could be an entry point to a different renderer.
  export const HostComponent = 5;
  export const HostText = 6;
  export const Fragment = 7;
  export const Mode = 8;
  export const ContextConsumer = 9;
  export const ContextProvider = 10;
  export const ForwardRef = 11;
  export const Profiler = 12;
  export const SuspenseComponent = 13;
  export const MemoComponent = 14;
  export const SimpleMemoComponent = 15;
  export const LazyComponent = 16;
  export const IncompleteClassComponent = 17;
  export const DehydratedFragment = 18;
  export const SuspenseListComponent = 19;
  export const ScopeComponent = 21;
  export const OffscreenComponent = 22;
  export const LegacyHiddenComponent = 23;
  export const CacheComponent = 24;
  export const TracingMarkerComponent = 25;
  export const HostHoistable = 26;
  export const HostSingleton = 27;
  ```
  <sub>출처: <a href="https://github.com/facebook/react/blob/main/packages/react-reconciler/src/ReactWorkTags.js">react Github - type WorkTag</a></sub>
<br>

## 2. 일렉트론 앱 내부 함수를 사용자 디렉토리에서 어떻게 실행시킬 수 있을까?

### 시도한 방법

* 우리가 만든 함수를 npm package에 등록해서 활용하기
  - 프로젝트 규모에 비해 큰 작업이라 판단했습니다.

### 결론

* `Symlink`를 활용합니다.

### Symlink란?

* 심링크(symlink) 또는 심볼릭 링크(symbolic link)는 리눅스의 파일의 한 종류로, 어떤 파일 시스템에서든 이미 생성되어 있는 다른 파일이나 디렉토리를 참조할 수 있습니다.

* 심링크를 생성하는 문법은 아래와 같습니다.<br>
  `ln -s <연결하고자 하는 원본 파일/폴더의 경로> <새로 생성하는 링크의 경로>`

=> 외부 사용자 디렉토리에서 일렉트론 앱 내부 함수를 참조할 수 있도록 하기 위해서 symlink를 사용하기로 했습니다.

### SymLink를 통해 사용자 디렉토리에서 reactree 함수 참조하기

* Node.js의 Child process `exec()`를 통해 `symlink`를 생성합니다.
* 사용자 디렉토리의 `src/index.js` 파일에서 `symlink`로 생성한 `reactree()`함수를 import 합니다.
```js
// public/Electron/ipc-handler.js

exec(
  `ln -s ${userHomePath}/Desktop/reactree-frontend/src/utils/reactree.js ${filePath}/src/reactree-symlink.js`,
  (error, stdout, stderr) => {
    const pathError = getErrorMessage(stderr);

    if (pathError) handleError(view, pathError);
  },
);

const JScodes = `
  // eslint-disable-next-line import/first
  import reactree from "./reactree-symlink";

  setTimeout(() => {
    reactree(root._internalRoot);
  }, 0);
`;

appendFileSync(`${filePath}/src/index.js`, JScodes);
```

<br>

## 3. 사용자 디렉토리에서 rootFiberNode를 어떻게 전송할 수 있을까?

### 시도한 방법

* 사용자코드 `<div id="root">` key값에 fiber 데이터 `json`을 할당하고, `view.webContents.executeJavascript()`를 실행해서 데이터 가져오기
  - 기능 구현은 되지만, 데이터용량 제한 및 유지보수 측면에서 로직이 비합리적이라 판단했습니다.

### 결론

`electron`으로 만들어진 서비스 - VScode, Slack에서는 필요한 데이터를 로컬에 `json`파일로 다운받는다는 사실을 알게 되었습니다.
이에 착안하여 사용자 프로젝트 컴포넌트 트리 구조 데이터를 `json`으로 다운받고, 그 파일을 읽어서 컴포넌트 구조를 시각화하는 방향으로 진행했습니다.

1. `exec()`를 통해 사용자 프로젝트를 개발모드로 실행시키면 `index.js`에서 symlink로 참조된 `reactree()`함수가 실행됩니다.
    ```js
    // public/Electron/ipc-handler.js

    execSync(`lsof -i :${portNumber} | grep LISTEN | awk '{print $2}' | xargs kill`);

    exec(
      `PORT=${portNumber} BROWSER=none npm start`,
      { cwd: filePath },
      (error, stdout, stderr) => {
        const startError = getErrorMessage(stderr);

        if (startError) handleError(view, startError);
      },
    );
    ```

2. `reactree()`함수가 실행되면 fiber 데이터가 들어있는 `data.json`을 사용자 로컬 저장공간에 다운받습니다.
    ```js
    // reactree-frontend/src/utils/reactree.js

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
    ```
3. 일렉트론 `ipc-handler`에서 `data.json`을 읽어서 renderer process로 데이터를 전송합니다.
    ```js
    // public/Electron/ipc-handler.js

    await waitOn({ resources: [`${userHomePath}/Downloads/data.json`] });

    const fiberFile = readFileSync(
      path.join(`${userHomePath}/Downloads/data.json`),
    );

    mainWindow.webContents.send("node-to-react", JSON.parse(fiberFile));
    ```

<br>

# Tech stack

### Frontend

- React
- Electron
- Redux, Redux-toolkit
- Styled-Component
- d3
- ESLint

### Test

- Jest, playwright

#### `Electron`을 사용한 이유

* 시스템 리소스 접근
  - 웹뷰 페이지 내에서 Node.js API를 직접 사용해서 파일 시스템에 접근할 수 있습니다. 이는 웹 브라우저에서는 일반적으로 사용할 수 없는 기능입니다.
* 웹 개발 기술 활용
  - 프론트엔드 영역 Renderer 프로세스에서는 Chromium을, 백엔드 영역 Main 프로세스에서는 Node.js를 사용하기 대문에, 기존의 웹 개발 기술을 활용할 수 있습니다.
* 크로스 플랫폼 호환성
  - Windows, macOS, Linux 등 다양한 운영 체제에서 실행할 수 있는 데스크톱 애플리케이션을 개발할 수 있습니다.

<br>

# Features

- Electron [ 이건화 40% / 김태우 30% / 박민주 30% ]
    - 시스템 리소스 접근으로 사용자의 로컬 저장소에 접근이 가능합니다.
    - `child_process` 로 사용자가 선택한 프로그램을 실행합니다.
    - 격리된 컨텍스트(`main`, `renderer`)에서 안전한 양방향 동기식 브릿지를 제공합니다.
- 심링크 파일 생성 [ 이건화 50% / 김태우 30% / 박민주 20% ]
    - 올바른 폴더를 선택하면 사용자의 프로젝트에 reactree함수를 실행할 수 있게 만드는 `Symlink` 파일을 생성합니다.
- 컴포넌트 계층 구조 데이터 추출 [ 이건화 20% / 김태우 40% / 박민주 40% ]
    - 재귀함수 `createNode()` 를 통해서 `fiber`객체에서 컴포넌트 계층 구조 데이터를 트리 구조로 추출합니다.
- 트리 구조 데이터 다운받기 [ 이건화 40% / 김태우 40% / 박민주 20% ]
    - `폴더 선택` 버튼을 누르면 `data.json` 다운로드 동의를 받는 창이 뜨고, electron view에서 사용자 코드를 렌더링해서 보여줍니다. (개발모드 렌더링 화면)
    - 이후에 바로 `data.json`을 다운로드 받고 이를 바탕으로 트리 구조를 화면에 렌더링하고, 바로 `data.json`은 삭제됩니다.
- 컴포넌트 계층 구조 시각화 [ 이건화 30% / 김태우 20% / 박민주 50% ]
    - 트리 구조에서 tag가 0인 `fiberNode`는 `FunctionComponent`를 뜻하는데, 이는 파란색으로 표시됩니다.
    - 트리 구조에서 마우스 스크롤을 하면 줌인/줌아웃이 되고, 드래그를 하면 트리 구조가 커서 위치에 따라서 이동합니다.
    - 트리 구조 상단의 WIDTH/HEIGHT 슬라이더 바를 조절하면 트리구조가 가로/세로 방향으로 작아지거나 커집니다.
- 트리 구조 모달창 [ 이건화 20% / 김태우 30% / 박민주 50% ]
    - 트리 구조에서 노드위에 마우스 커서를 올리면 컴포넌트 정보를 보여주는 모달창이 보입니다.
    - 일렉트론앱 window 가로와 모달창 가로 길이에 따라서 커서 오른쪽에 보이던 모달창이 안 보일 정도로 마우스가 오른쪽에 가까워지면 모달창이 왼쪽에서 보입니다. (반응형)
    - 모달창에는 컴포넌트의 이름, `props`, `local state`와 `redux state`을 보여줍니다.
- 코드 뷰어 [ 이건화 40% / 김태우 20% / 박민주 40% ]
    - 트리의 노드를 클릭시 해당 컴포넌트가 렌더링된 위치의 js파일 경로와 코드를 보여줍니다.
    - 컴포넌트가 아닌 노드를 클릭하거나 X버튼을 누르면 코드뷰어와 경로정보가 사라집니다.
- 폴더 선택 [ 이건화 30% / 김태우 50% / 박민주 20% ]
    - 잘못된 폴더를 선택하면 에러 팝업창과 에러 페이지가 렌더링됩니다.
    - 폴더선택 버튼을 한 번 더 누르면 새로운 프로젝트를 불러와서 트리 구조를 그릴 수 있습니다.

<br>

# Timeline

프로젝트 기간 : 2023.03.06(월) ~ 2023.03.30(목)

- 1주차: 아이디어 기획 및 목업 작성
- 2~3주차: 기능 개발
- 4주차: 테스트코드 작성, 발표

# Contacts

- 이건화 - ghlee2588@gmail.com
- 김태우 - taewoo124@gmail.com
- 박민주 - jsi04049@gmail.com
