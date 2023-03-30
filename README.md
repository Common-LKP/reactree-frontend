# Reactree소개

reactree는 사용자의 리액트 프로젝트 구조를 시각화해주는 앱 서비스입니다.

# Table of Contents

- [🔍 Preview](#Preview)
- [⚙️ Tech stack](#Tech-stack)
- [💭 Motivation](#Motivation)
- [💻 Features](#Features)
- [💫 Challenges](#Challenges)
- [📅 Timeline](#Timeline)
- [📝 Memoir](#Memoir)

# 🔍 Preview

🔽 폴더 선택 후 트리구조 렌더링
![reactreeGIF1](https://user-images.githubusercontent.com/50537876/228586806-b776bc89-8750-49f8-8a9d-8f969f12b7a7.gif)
🔽 트리구조 줌인/줌아웃, 슬라이더바 조절, 노드 마우스 이벤트(호버링, 클릭)
![reactreeGIF2](https://user-images.githubusercontent.com/50537876/228586858-d02b2f78-151e-4ee9-b837-433cb2b20b17.gif)

# ⚙️ Tech stack

### Frontend

- React
- Electron
- Redux, Redux-toolkit
- Styled-Component
- d3
- ESLint

### Test

- Jest, playwright

# 💭 Motivation

리액트 공부를 시작했을 때 또는 다른 사람이 만든 리액트 프로젝트 코드를 처음 읽을 때, 전체적인 컴포넌트 구조를 이해하는 데 시간이 걸렸습니다.
‘렌더링된 컴포넌트의 구조를 시각화해서 같이 보여준다면 리액트를 개발하는데 더 도움이 되지 않을까’ 라는 생각으로 이 프로젝트를 시작하게 되었습니다.

# 💻 Features

- `폴더 선택` 버튼을 누르면 `data.json` 다운로드 동의를 받는 창이 뜨고, 사용자 코드를 view에서 렌더링해서 보여줍니다. (개발모드 렌더링 화면입니다.)
- 이후에 바로 `data.json`을 다운로드 받고 이를 바탕으로 트리 구조를 화면에 렌더링하고, 바로 `data.json`은 삭제됩니다.
- 트리 구조에서 tag가 0인 `fiberNode`은 FunctionComponent를 뜻하는데, 이는 파란색으로 표시됩니다.
- 트리 구조에서 마우스 스크롤을 하면 줌인/줌아웃이 되고, 드래그를 하면 트리 구조가 커서 위치에 따라서 이동합니다.
- 트리 구조 상단의 WIDTH/HEIGHT 슬라이더 바를 조절하면 트리구조가 가로/세로 방향으로 작아지거나 커집니다.
- 트리 구조에서 노드위에 마우스 커서를 올리면 컴포넌트 정보를 보여주는 모달창이 보입니다.
- 일렉트론앱 window 가로와 모달창 가로 길이에 따라서 커서 오른쪽에 보이던 모달창이 안 보일 정도로 마우스가 오른쪽에 가까워지면 모달창이 왼쪽에서 보입니다. (반응형)
- 모달창에는 컴포넌트의 이름, `props`, `local state`와 `redux state`을 보여줍니다.
- 트리의 노드를 클릭시 해당 컴포넌트가 렌더링된 위치의 js파일 경로와 코드를 보여줍니다.
- 컴포넌트가 아닌 노드를 클릭하거나 X버튼을 누르면 코드뷰어와 경로정보가 사라집니다.
- 폴더선택 버튼을 한 번 더 누르면 새로운 프로젝트를 불러와서 트리 구조를 그릴 수 있습니다.
- 잘못된 폴더를 선택하면 에러 팝업창과 에러 페이지가 렌더링됩니다.

# 💫 Challenges

## 1. 사용자 코드를 어떻게 파싱할까 -> Electron & React fiber 활용

### 시도한 방법

- Github repo에 API요청을 보내서 코드를 문자열로 받기
  - 외부 library 없이 문자열을 javascript문법으로 파싱하기에는 경우의 수가 너무 많음. 한정된 시간 내에 구현하기에는 무리라고 판단함.
- ReactDOMServer Object 활용하기
  - ReactDOMServer 객체를 사용하여 컴포넌트를 정적 마크업으로 렌더링할 수 있음. 그런데 Component또한 일반 태그로 출력돼서 Component 이름을 별도로 추출할 수 있는 작업이 필요함.
- `React.Children` 속성 활용하기
  - Component의 이름을 추출해 계층구조를 시각화는 할 수 있음. 그러나 App Component의 return 구문내에 선언된 Component에만 국한되는 문제가 있음. (일반 태그들은 표시되지 않음.)

### 결론

- 코드 파싱이 아니라 현재 화면에 렌더링된 컴포넌트 정보를 활용하자 -> **React Fiber** 활용
- 사용자 디렉토리에서 `npm start`를 실행시켜서 localhost에서 렌더링된 화면을 일렉트론view로 보여주자 -> **Electron** 앱에서 `child_process` 활용

#### **React Fiber**란?

: React v16에서 리액트의 핵심 알고리즘을 재구성한 새로운 재조정(Reconciliation) 엔진

- React Fiber의 구조

  - `current`, `working in process` 2개의 트리구조를 지님.
  - children 배열을 지닌 일반적인 트리 구조로 예상했으나, 각 `fiberNode`별로 `child`와 `sibiling` 속성으로 자신의 다음 노드를 가리키는 일종의 연결리스트 형태를 띄고 있음.
  - 이러한 연결리스트 형태를 트리 구조로 바꾸기 위해 재귀함수 `createNode()`를 만들어서 컴포넌트 트리 구조 데이터를 추출함.
  - 각 노드는 `tag`로 구분되는데, 데이터 추출 과정에서 `tag`를 기준삼아서 DOM 트리에 불필요한 노드는 제외시킴.
  - 순환참조를 일으키는 속성이 다수 존재함. 이는 json파일 생성과정에서 `JSON.stringify()`를 할 수 없기에 순환참조 속성은 제외시킴.

    ```javascript
    /* cf) fiberNode tag 분류 */
    const FunctionComponent = 0;
    const ClassComponent = 1;
    const IndeterminateComponent = 2;
    const HostRoot = 3;
    const HostPortal = 4;
    const HostComponent = 5;
    const HostText = 6;
    const Fragment = 7;
    const Mode = 8;
    const ContextConsumer = 9;
    const ContextProvider = 10;
    const ForwardRef = 11;
    const Profiler = 12;
    const SuspenseComponent = 13;
    const MemoComponent = 14;
    const SimpleMemoComponent = 15;
    const LazyComponent = 16;
    const IncompleteClassComponent = 17;
    const DehydratedFragment = 18;
    const SuspenseListComponent = 19;
    // 20 없음
    const ScopeComponent = 21;
    const OffscreenComponent = 22;
    const LegacyHiddenComponent = 23;
    const CacheComponent = 24;
    ```

## 2. 우리가 작성한 함수를 사용자 코드에서 어떻게 실행시킬 수 있을까

### 시도한 방법

- 우리가 만든 함수를 npm package에 등록해서 활용하기
  - 프로젝트 규모에 비해 큰 작업임.

### 결론

- `Symlink` 활용하기

#### **Symlink**란?

심링크(symlink) 또는 심볼릭 링크(symbolic link)는 리눅스의 파일의 한 종류로, 어떤 파일 시스템에서든 이미 생성되어 있는 다른 파일이나 디렉토리를 참조할 수 있습니다.

=> 외부 사용자 디렉토리에서 우리가 만든 함수에 접근할 수 있도록 하기 위해서 symlink를 사용하기로 했습니다.

## 3. 사용자 디렉토리에서 rootFiberNode를 어떻게 전송할 수 있을까

### 시도한 방법들

- `fetch API` 를 활용해서 electron으로 데이터 전송
  - fetch를 하려면 서버가 필요한데, 이러면 사실상 electron 사용하는 의미가 없어짐.
- 사용자코드 `<div id="root">` key값에 react fiber 데이터 JSON.stringify()한 값을 할당하고, `view.webContents.executeJavascript()`로 가져오기
  - 기능 구현은 되지만, 데이터용량 제한 및 유지보수 측면에서 로직이 비합리적임.

### 결론

- `electron`으로 만들어진 VScode, Slack에서 필요한 데이터를 로컬에 `json`으로 다운받는 것에서 착안하여, 사용자 프로젝트 컴포넌트 트리구조 데이터를 `json`으로 다운받고 그 파일을 읽어서 트리를 시각화했습니다.

## 📅 Timeline

프로젝트 기간 : 2023.03.06(월) ~ 2023.03.30(목)

- 1주차: 아이디어 기획 및 목업 작성
- 2~4주차: 기능 개발, 테스트, 발표 준비

## 📝 Memoir

<details>
<summary>이건화</summary>
건화님 소감
</details>
<details>
<summary>김태우</summary>
태우님 소감
</details>
<details>
<summary>박민주</summary>
민주님 소감
</details>

## Contacts

- 이건화 - ghlee2588@gmail.com
- 김태우 - taewoo124@gmail.com
- 박민주 - jsi04049@gmail.com
